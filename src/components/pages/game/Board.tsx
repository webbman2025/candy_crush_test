import gsap from "gsap";
import { Fragment, useEffect, useRef, useState } from "react";
import useSound from "@hooks/useSound";
import { Item } from "@/types/game";
import styles from "./Board.module.scss";
import Cell from "./Cell";
import { gameConfig } from "@config/gameConfig";

interface BoardProps {
  width: number;
  height: number;
  currentLevel?: number;
  maxHolesForLevel?: number;
  onHoleCountChange?: (count: number) => void;
  audioOn: boolean;
  onMatch: (score: number) => void;
  onEggMatch?: (eggCount: number) => void;
  onResetCombo: () => void;
  items: string[];
  disabled?: boolean;
  onSpecialItemMatch?: (count: number) => void;
}

const Board: React.FC<BoardProps> = ({
  width,
  height,
  currentLevel = 1,
  maxHolesForLevel = 0,
  onHoleCountChange,
  audioOn,
  onMatch,
  onEggMatch,
  onResetCombo,
  items,
  disabled = false,
  onSpecialItemMatch,
}) => {
  const [board, setBoard] = useState<Item[][]>([]);
  const [holeCells, setHoleCells] = useState<Set<string>>(new Set());
  const [dragStart, setDragStart] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [hintCells, setHintCells] = useState<Set<string>>(new Set());
  const [isFreezing, setIsFreezing] = useState(true);
  const cellRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const initialClear = useRef(true);
  const matchEventsRef = useRef(0);

  const audioOnRef = useRef(audioOn);

  useEffect(() => {
    audioOnRef.current = audioOn;
  }, [audioOn]);

  // Sound effects
  const matchSound = useSound(gameConfig.sounds.effects.match.path, {
    volume: gameConfig.sounds.effects.match.volume,
  });
  const swapSound = useSound(gameConfig.sounds.effects.swap.path, {
    volume: gameConfig.sounds.effects.swap.volume,
  });
  const spawnSound = useSound(gameConfig.sounds.effects.spawn.path, {
    volume: gameConfig.sounds.effects.spawn.volume,
  });
  // const invalidSound = useSound("/sounds/invalid.mp3", { volume: 0.4 });

  const specialItemType = 1; // Assuming type 1 is the special item

  // Only types 5 and 6 use egg02.png – they match each other; other types match only themselves.
  const isEggType = (t: number): boolean => t === 5 || t === 6;
  const sameVisualType = (a: number, b: number): boolean => {
    if (a <= 0 || b <= 0) return false;
    if (a === b) return true;
    return isEggType(a) && isEggType(b);
  };

  const isHole = (row: number, col: number) => holeCells.has(`${row},${col}`);
  const isHoleFromSet = (holes: Set<string>, row: number, col: number) =>
    holes.has(`${row},${col}`);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buildPlayableBoard = (holes: Set<string>): Item[][] => {
    const maxBoardAttempts = 80;
    let lastBoard: Item[][] = [];

    for (let boardAttempt = 0; boardAttempt < maxBoardAttempts; boardAttempt++) {
      const newBoard: Item[][] = [];

      // Initialize empty board first
      for (let row = 0; row < height; row++) {
        const newRow: Item[] = [];
        for (let col = 0; col < width; col++) {
          if (isHoleFromSet(holes, row, col)) {
            newRow.push({
              type: 0,
              isMatched: false,
            });
            continue;
          }
          newRow.push({
            type: 0, // Temporary placeholder
            isMatched: false,
          });
        }
        newBoard.push(newRow);
      }

      // Fill board ensuring no initial matches
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          if (isHoleFromSet(holes, row, col)) continue;
          let validType = false;
          let attempts = 0;
          const maxAttempts = 100; // Prevent infinite loops

          while (!validType && attempts < maxAttempts) {
            const randomType = getRandomItemType();
            newBoard[row][col].type = randomType;

            // Check if this placement creates a match (use visual check so 3 egg02 in a row are avoided)
            const hasMatch = checkForVisualMatchAt(newBoard, row, col, holes);

            if (!hasMatch) {
              validType = true;
            }
            attempts++;
          }

          // Fallback: if we can't find a valid type after max attempts,
          // use the first available type (this should rarely happen)
          if (!validType) {
            newBoard[row][col].type = 1;
          }
        }
      }

      lastBoard = newBoard;
      if (hasPossibleMove(newBoard, holes)) {
        return newBoard;
      }
    }

    return lastBoard;
  };

  // Initialize the board with random items
  const initializeBoard = () => {
    const initialHoles = new Set<string>();
    setHoleCells(initialHoles);
    matchEventsRef.current = 0;
    const newBoard = buildPlayableBoard(initialHoles);
    setBoard(newBoard);
  };

  const createsMatchAt = (
    boardToCheck: Item[][],
    row: number,
    col: number,
    itemType: number,
    holes: Set<string> = holeCells
  ): boolean => {
    if (isHoleFromSet(holes, row, col) || itemType <= 0) return false;

    // Check horizontal match (left and right)
    let horizontalCount = 1;

    // Count left
    for (
      let c = col - 1;
      c >= 0 &&
      !isHoleFromSet(holes, row, c) &&
      boardToCheck[row][c].type === itemType;
      c--
    ) {
      horizontalCount++;
    }

    // Count right
    for (
      let c = col + 1;
      c < width &&
      !isHoleFromSet(holes, row, c) &&
      boardToCheck[row][c].type === itemType;
      c++
    ) {
      horizontalCount++;
    }

    if (horizontalCount >= 3) {
      return true;
    }

    // Check vertical match (up and down)
    let verticalCount = 1;

    // Count up
    for (
      let r = row - 1;
      r >= 0 &&
      !isHoleFromSet(holes, r, col) &&
      boardToCheck[r][col].type === itemType;
      r--
    ) {
      verticalCount++;
    }

    // Count down
    for (
      let r = row + 1;
      r < height &&
      !isHoleFromSet(holes, r, col) &&
      boardToCheck[r][col].type === itemType;
      r++
    ) {
      verticalCount++;
    }

    if (verticalCount >= 3) {
      return true;
    }

    return false;
  };

  // Helper function to check if placing an item at a specific position creates a match
  const checkForMatchAt = (
    board: Item[][],
    row: number,
    col: number,
    holes: Set<string> = holeCells
  ): boolean => {
    return createsMatchAt(board, row, col, board[row][col].type, holes);
  };

  // Like createsMatchAt but treats all egg types (e.g. 5 and 6) as same visual – avoids 3 egg02 in a row on fill
  const createsVisualMatchAt = (
    boardToCheck: Item[][],
    row: number,
    col: number,
    itemType: number,
    holes: Set<string> = holeCells
  ): boolean => {
    if (isHoleFromSet(holes, row, col) || itemType <= 0) return false;

    let horizontalCount = 1;
    for (
      let c = col - 1;
      c >= 0 &&
      !isHoleFromSet(holes, row, c) &&
      sameVisualType(itemType, boardToCheck[row][c].type);
      c--
    ) {
      horizontalCount++;
    }
    for (
      let c = col + 1;
      c < width &&
      !isHoleFromSet(holes, row, c) &&
      sameVisualType(itemType, boardToCheck[row][c].type);
      c++
    ) {
      horizontalCount++;
    }
    if (horizontalCount >= 3) return true;

    let verticalCount = 1;
    for (
      let r = row - 1;
      r >= 0 &&
      !isHoleFromSet(holes, r, col) &&
      sameVisualType(itemType, boardToCheck[r][col].type);
      r--
    ) {
      verticalCount++;
    }
    for (
      let r = row + 1;
      r < height &&
      !isHoleFromSet(holes, r, col) &&
      sameVisualType(itemType, boardToCheck[r][col].type);
      r++
    ) {
      verticalCount++;
    }
    if (verticalCount >= 3) return true;
    return false;
  };

  const checkForVisualMatchAt = (
    board: Item[][],
    row: number,
    col: number,
    holes: Set<string> = holeCells
  ): boolean => {
    return createsVisualMatchAt(board, row, col, board[row][col].type, holes);
  };

  const stabilizeBoardAfterRefill = (
    boardToStabilize: Item[][],
    holes: Set<string> = holeCells
  ) => {
    const maxPasses = 24;
    let pass = 0;

    while (pass < maxPasses) {
      const accidentalMatches = findVisualMatches(boardToStabilize, holes);
      if (accidentalMatches.length === 0) {
        break;
      }

      accidentalMatches.forEach(({ row, col }) => {
        if (isHoleFromSet(holes, row, col)) return;

        let nextType = getRandomItemType();
        let attempts = 0;
        const maxAttempts = Math.max(items.length * 4, 12);

        while (attempts < maxAttempts) {
          boardToStabilize[row][col].type = nextType;
          if (!createsVisualMatchAt(boardToStabilize, row, col, nextType, holes)) {
            break;
          }
          nextType = getRandomItemType();
          attempts++;
        }

        boardToStabilize[row][col] = {
          ...boardToStabilize[row][col],
          type: nextType,
          isMatched: false,
          isNew: true,
        };
      });

      pass++;
    }
  };

  useEffect(() => {
    initializeBoard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onHoleCountChange?.(holeCells.size);
  }, [holeCells, onHoleCountChange]);

  useEffect(() => {
    if (initialClear.current && board.length > 0) {
      initialClear.current = false;

      // Check for matches after board changes
      const checkMatches = () => {
        const matches = findMatches();
        if (matches.length > 0) {
          handleMatches(matches);
          return true;
        }
        return false;
      };

      const timer = setTimeout(() => {
        const hasMatches = checkMatches();
        if (!hasMatches) {
          setDragStart(null);
          // Enable dragging since no initial matches were found
          setIsFreezing(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [board]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle drag operations
  const handleDragStart = (row: number, col: number) => {
    if (isFreezing || disabled || isHole(row, col)) return;
    setHintCells(new Set());
    setDragStart({ row, col });
  };

  const handleDragEnter = (row: number, col: number) => {
    if (isFreezing || disabled || !dragStart || isHole(row, col)) return;

    // Check if the cell is adjacent to the drag start cell
    const rowDiff = Math.abs(dragStart.row - row);
    const colDiff = Math.abs(dragStart.col - col);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // Immediately swap when dragging over an adjacent cell
      setHintCells(new Set());
      if (audioOnRef.current) {
        swapSound.play();
      }
      swapItems(dragStart.row, dragStart.col, row, col);
      setDragStart(null);
    }
  };

  const handleDragEnd = () => {
    setHintCells(new Set());
    setDragStart(null);
  };

  // Function to get cell ref key
  const getCellRefKey = (row: number, col: number) => `cell-${row}-${col}`;

  // Register cell ref
  const registerCellRef = (
    row: number,
    col: number,
    el: HTMLDivElement | null
  ) => {
    if (el) {
      cellRefs.current[getCellRefKey(row, col)] = el;
    }
  };

  // Create a virtual copy of the board for match checking
  const createVirtualBoard = (sourceBoard: Item[][]): Item[][] => {
    return sourceBoard.map((row) => row.map((item) => ({ ...item })));
  };

  // Virtual swap function that doesn't update state
  const virtualSwapItems = (
    virtualBoard: Item[][],
    row1: number,
    col1: number,
    row2: number,
    col2: number
  ): Item[][] => {
    const tempType = virtualBoard[row1][col1].type;
    virtualBoard[row1][col1].type = virtualBoard[row2][col2].type;
    virtualBoard[row2][col2].type = tempType;
    return virtualBoard;
  };

  const hasPossibleMove = (
    boardToCheck: Item[][],
    holes: Set<string> = holeCells
  ): boolean => {
    return Boolean(findHintMove(boardToCheck, holes));
  };

  const keyOf = (row: number, col: number) => `${row},${col}`;

  // Keep only matches that are actually triggered by the swapped cells.
  // This prevents clearing unrelated pre-existing matches elsewhere on the board.
  const getSwapTriggeredMatches = (
    allMatches: { row: number; col: number }[],
    row1: number,
    col1: number,
    row2: number,
    col2: number
  ): { row: number; col: number }[] => {
    if (allMatches.length === 0) return [];

    const allSet = new Set(allMatches.map((m) => keyOf(m.row, m.col)));
    const seedKeys = [keyOf(row1, col1), keyOf(row2, col2)].filter((k) =>
      allSet.has(k)
    );
    if (seedKeys.length === 0) return [];

    const visited = new Set<string>();
    const queue: string[] = [...seedKeys];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const [r, c] = current.split(",").map(Number);
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];
      neighbors.forEach(([nr, nc]) => {
        const nKey = keyOf(nr, nc);
        if (allSet.has(nKey) && !visited.has(nKey)) {
          queue.push(nKey);
        }
      });
    }

    return allMatches.filter((m) => visited.has(keyOf(m.row, m.col)));
  };

  const findHintMove = (
    boardToCheck: Item[][],
    holes: Set<string> = holeCells
  ): { row1: number; col1: number; row2: number; col2: number } | null => {
    const neighbors = [
      [0, 1],
      [1, 0],
    ];

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (isHoleFromSet(holes, row, col) || boardToCheck[row][col].type <= 0) {
          continue;
        }

        for (const [dr, dc] of neighbors) {
          const nextRow = row + dr;
          const nextCol = col + dc;
          if (nextRow >= height || nextCol >= width) continue;
          if (
            isHoleFromSet(holes, nextRow, nextCol) ||
            boardToCheck[nextRow][nextCol].type <= 0
          ) {
            continue;
          }

          const virtualBoard = createVirtualBoard(boardToCheck);
          virtualSwapItems(virtualBoard, row, col, nextRow, nextCol);
          const allMatches = findMatches(virtualBoard, holes);
          const triggeredMatches = getSwapTriggeredMatches(
            allMatches,
            row,
            col,
            nextRow,
            nextCol
          );
          if (triggeredMatches.length > 0) {
            return { row1: row, col1: col, row2: nextRow, col2: nextCol };
          }
        }
      }
    }

    return null;
  };

  const findMatches = (
    boardToCheck: Item[][] = board,
    holes: Set<string> = holeCells
  ) => {
    const matches: { row: number; col: number }[] = [];
    const a = (r: number, c: number) => boardToCheck[r][c].type;
    const isMatch3 = (t1: number, t2: number, t3: number) =>
      t1 > 0 && t2 > 0 && t3 > 0 && sameVisualType(t1, t2) && sameVisualType(t2, t3);

    // Check rows for matches (eggs: 5 and 6 count as same so 5-6-5 matches)
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width - 2; col++) {
        if (
          isHoleFromSet(holes, row, col) ||
          isHoleFromSet(holes, row, col + 1) ||
          isHoleFromSet(holes, row, col + 2)
        ) continue;
        if (isMatch3(a(row, col), a(row, col + 1), a(row, col + 2))) {
          matches.push({ row, col });
          matches.push({ row, col: col + 1 });
          matches.push({ row, col: col + 2 });
        }
      }
    }

    // Check columns for matches
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height - 2; row++) {
        if (
          isHoleFromSet(holes, row, col) ||
          isHoleFromSet(holes, row + 1, col) ||
          isHoleFromSet(holes, row + 2, col)
        ) continue;
        if (isMatch3(a(row, col), a(row + 1, col), a(row + 2, col))) {
          matches.push({ row, col });
          matches.push({ row: row + 1, col });
          matches.push({ row: row + 2, col });
        }
      }
    }

    // Remove duplicates
    const uniqueMatches = Array.from(
      new Set(matches.map((m) => `${m.row},${m.col}`))
    ).map((id) => {
      const [row, col] = id.split(",").map(Number);
      return { row, col };
    });

    return uniqueMatches;
  };

  // Like findMatches but treats egg types as same – finds 3+ egg02 in a row (e.g. 5-6-5)
  const findVisualMatches = (
    boardToCheck: Item[][],
    holes: Set<string> = holeCells
  ): { row: number; col: number }[] => {
    const matches: { row: number; col: number }[] = [];

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width - 2; col++) {
        const a = boardToCheck[row][col].type;
        const b = boardToCheck[row][col + 1].type;
        const c = boardToCheck[row][col + 2].type;
        if (
          isHoleFromSet(holes, row, col) ||
          isHoleFromSet(holes, row, col + 1) ||
          isHoleFromSet(holes, row, col + 2) ||
          a <= 0 || b <= 0 || c <= 0
        ) continue;
        if (sameVisualType(a, b) && sameVisualType(b, c)) {
          matches.push({ row, col });
          matches.push({ row, col: col + 1 });
          matches.push({ row, col: col + 2 });
        }
      }
    }
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height - 2; row++) {
        const a = boardToCheck[row][col].type;
        const b = boardToCheck[row + 1][col].type;
        const c = boardToCheck[row + 2][col].type;
        if (
          isHoleFromSet(holes, row, col) ||
          isHoleFromSet(holes, row + 1, col) ||
          isHoleFromSet(holes, row + 2, col) ||
          a <= 0 || b <= 0 || c <= 0
        ) continue;
        if (sameVisualType(a, b) && sameVisualType(b, c)) {
          matches.push({ row, col });
          matches.push({ row: row + 1, col });
          matches.push({ row: row + 2, col });
        }
      }
    }
    return Array.from(
      new Set(matches.map((m) => `${m.row},${m.col}`))
    ).map((id) => {
      const [r, c] = id.split(",").map(Number);
      return { row: r, col: c };
    });
  };

  const handleMatches = (matches: { row: number; col: number }[]) => {
    matchEventsRef.current += 1;

    if (matches.length > 0) {
      if (audioOnRef.current) {
        matchSound.play();
      }
    }

    const newBoard = [...board];

    // Count special items (type === 1) in matches
    let specialItemCount = 0;
    let eggMatchCount = 0;

    // Mark matched items
    matches.forEach(({ row, col }) => {
      newBoard[row][col] = { ...newBoard[row][col], isMatched: true };
      if (board[row][col].type === specialItemType) {
        specialItemCount++;
      }
      if (isEggType(board[row][col].type)) {
        eggMatchCount++;
      }
    });

    // Call parent callback if there are special items matched
    if (specialItemCount > 0 && onSpecialItemMatch) {
      onSpecialItemMatch(specialItemCount);
    }
    if (eggMatchCount > 0 && onEggMatch) {
      onEggMatch(eggMatchCount);
    }

    setBoard(newBoard);
    onMatch(matches.length);

    // Replace matched items after a delay
    setTimeout(() => {
      replaceMatches(matches);
    }, 350);
  };

  const replaceMatches = async (matches: { row: number; col: number }[]) => {
    setHintCells(new Set());
    const newBoard = board.map((row) => row.map((item) => ({ ...item })));
    const matchedSet = new Set(matches.map(({ row, col }) => `${row},${col}`));
    let activeHoles = holeCells;

    for (let col = 0; col < width; col++) {
      const playableRows: number[] = [];
      const survivors: number[] = [];

      for (let row = 0; row < height; row++) {
        if (isHole(row, col)) continue;
        playableRows.push(row);
      }

      for (let i = playableRows.length - 1; i >= 0; i--) {
        const row = playableRows[i];
        if (!matchedSet.has(`${row},${col}`)) {
          survivors.unshift(newBoard[row][col].type);
        }
      }

      const spawnCount = playableRows.length - survivors.length;
      const spawned: number[] = [];
      const nextTypes = [...Array(spawnCount).fill(0), ...survivors];

      for (let idx = 0; idx < spawnCount; idx++) {
        const row = playableRows[idx];
        let selectedType = getRandomItemType();
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
          nextTypes[idx] = selectedType;
          newBoard[row][col] = { type: selectedType, isMatched: false, isNew: true };
          if (!createsVisualMatchAt(newBoard, row, col, selectedType)) {
            break;
          }
          selectedType = getRandomItemType();
          attempts++;
        }

        spawned.push(selectedType);
        nextTypes[idx] = selectedType;
      }

      playableRows.forEach((row, idx) => {
        const nextType = nextTypes[idx];
        const oldType = newBoard[row][col].type;
        newBoard[row][col] = {
          type: nextType,
          isMatched: false,
          isNew: oldType !== nextType,
        };
      });
    }

    if (
      matchEventsRef.current >= 3 &&
      maxHolesForLevel > 0 &&
      holeCells.size < maxHolesForLevel
    ) {
      const nextHoles = new Set(holeCells);
      const candidates: Array<{ row: number; col: number }> = [];
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const key = `${row},${col}`;
          if (nextHoles.has(key)) continue;
          if (newBoard[row][col].type <= 0) continue;
          candidates.push({ row, col });
        }
      }

      if (candidates.length > 0) {
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        nextHoles.add(`${picked.row},${picked.col}`);
        newBoard[picked.row][picked.col] = {
          type: 0,
          isMatched: false,
          isNew: false,
        };
        activeHoles = nextHoles;
        setHoleCells(nextHoles);
      }
    }

    // Prevent runaway auto-cascades by stabilizing refill output:
    // no immediate random matches should exist right after refill.
    stabilizeBoardAfterRefill(newBoard, activeHoles);

    // Prevent dead-boards: if no valid swap remains, rebuild with same holes.
    if (!hasPossibleMove(newBoard, activeHoles)) {
      const rebuiltBoard = buildPlayableBoard(activeHoles);
      setBoard(rebuiltBoard);
      if (audioOnRef.current) {
        spawnSound.play();
      }
      onResetCombo();
      setIsFreezing(false);
      return;
    }

    setBoard(newBoard);
    if (audioOnRef.current) {
      spawnSound.play();
    }

    setTimeout(() => {
      const nextMatches = findMatches(newBoard);
      if (nextMatches.length > 0) {
        handleMatches(nextMatches);
      } else {
        onResetCombo();
        setIsFreezing(false);
      }
    }, 120);

    setTimeout(() => {
      setBoard((prev) =>
        prev.map((row) =>
          row.map((item) => ({
            ...item,
            isNew: false,
          }))
        )
      );
    }, 240);
  };

  const swapItems = (
    row1: number,
    col1: number,
    row2: number,
    col2: number
  ) => {
    const swapItemDuration = 0.3;

    if (isFreezing) return;
    setHintCells(new Set());
    setIsFreezing(true);

    // Create virtual board to check for matches without updating state
    const virtualBoard = createVirtualBoard(board);
    virtualSwapItems(virtualBoard, row1, col1, row2, col2);
    const allPotentialMatches = findMatches(virtualBoard);
    const potentialMatches = getSwapTriggeredMatches(
      allPotentialMatches,
      row1,
      col1,
      row2,
      col2
    );

    // Get references to the cells to animate
    const cell1Ref = cellRefs.current[getCellRefKey(row1, col1)];
    const cell2Ref = cellRefs.current[getCellRefKey(row2, col2)];

    if (cell1Ref && cell2Ref) {
      console.log(
        "Animation starting for cells:",
        { row: row1, col: col1 },
        { row: row2, col: col2 }
      );

      // Calculate the positions for the animation
      const cell1Rect = cell1Ref.getBoundingClientRect();
      const cell2Rect = cell2Ref.getBoundingClientRect();

      const xDistance = cell2Rect.left - cell1Rect.left;
      const yDistance = cell2Rect.top - cell1Rect.top;

      // Save the cell colors BEFORE modifying state
      const cell1Type = board[row1][col1].type;
      const cell2Type = board[row2][col2].type;

      // Get the colors for the original types
      const cell1BackgroundColor = getComputedStyle(cell1Ref).backgroundColor;
      const cell2BackgroundColor = getComputedStyle(cell2Ref).backgroundColor;

      // Create placeholder clones for animation
      const createPlaceholder = (
        sourceCell: HTMLDivElement,
        backgroundColor: string,
        imageSrc: string
      ) => {
        const placeholder = document.createElement("div");

        // Copy styles from the original cell
        const sourceStyles = getComputedStyle(sourceCell);
        placeholder.style.position = "absolute";
        placeholder.style.width = sourceStyles.width;
        placeholder.style.height = sourceStyles.height;
        placeholder.style.borderRadius = sourceStyles.borderRadius;
        placeholder.style.backgroundColor = backgroundColor;
        placeholder.style.zIndex = "1000";
        placeholder.style.display = "flex";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        placeholder.style.boxShadow = sourceStyles.boxShadow;

        // Position at the same spot as the original cell
        const rect = sourceCell.getBoundingClientRect();
        const boardRect = sourceCell
          .closest(`.${styles.board}`)
          ?.getBoundingClientRect() || { left: 0, top: 0 };

        placeholder.style.left = `${rect.left - boardRect.left}px`;
        placeholder.style.top = `${rect.top - boardRect.top}px`;

        // Add image content with responsive size
        const img = document.createElement("img");
        img.src = imageSrc;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.pointerEvents = "none";
        placeholder.appendChild(img);

        // Add to the board container
        sourceCell.closest(`.${styles.board}`)?.appendChild(placeholder);

        return placeholder;
      };

      // Get images for the item types
      const cell1Image = getItemImage(cell1Type);
      const cell2Image = getItemImage(cell2Type);

      // Create placeholders
      const placeholder1 = createPlaceholder(
        cell1Ref,
        cell1BackgroundColor,
        cell1Image
      );
      const placeholder2 = createPlaceholder(
        cell2Ref,
        cell2BackgroundColor,
        cell2Image
      );

      // Hide the original cells
      cell1Ref.style.opacity = "0";
      cell2Ref.style.opacity = "0";

      // Create a GSAP timeline for the animation
      let hasTriggeredEarlyCompletion = false; // Flag to ensure completion logic runs only once

      // Create a GSAP timeline for the animation
      const tl = gsap.timeline({
        onUpdate: function () {
          // Trigger completion logic at 60% progress
          if (this.progress() >= 0.6 && !hasTriggeredEarlyCompletion) {
            hasTriggeredEarlyCompletion = true;

            console.log("Animation 60% completed");

            // Check if the swap resulted in a match using pre-calculated results
            if (potentialMatches.length > 0) {
              // Only update the board state if the swap is valid
              const newBoard = [...board];
              const tempType = newBoard[row1][col1].type;
              newBoard[row1][col1].type = newBoard[row2][col2].type;
              newBoard[row2][col2].type = tempType;
              setBoard(newBoard);

              // Delay showing the original cells to prevent flickering
              setTimeout(() => {
                // Remove placeholders first
                placeholder1.remove();
                placeholder2.remove();

                // Then show the original cells with updated images
                cell1Ref.style.opacity = "1";
                cell2Ref.style.opacity = "1";

                // Additional delay before handling matches to ensure smooth transition
                setTimeout(() => {
                  handleMatches(potentialMatches);
                }, 50);
              }, 32);
            }
          }
        },
        onComplete: () => {
          console.log("Animation fully completed");

          // Check if the swap resulted in a match using pre-calculated results
          if (potentialMatches.length === 0) {
            // Invalid swap - play invalid sound and revert animation
            // invalidSound.play();

            const tl2 = gsap.timeline({
              onComplete: () => {
                // Show the original cells
                cell1Ref.style.opacity = "1";
                cell2Ref.style.opacity = "1";

                setTimeout(() => {
                  // Remove placeholders
                  placeholder1.remove();
                  placeholder2.remove();

                  setIsFreezing(false);
                }, 10);
              },
            });
            tl2.to(
              placeholder1,
              {
                x: 0,
                y: 0,
                duration: swapItemDuration,
                ease: "power2.out",
              },
              0
            );
            tl2.to(
              placeholder2,
              {
                x: 0,
                y: 0,
                duration: swapItemDuration,
                ease: "power2.out",
              },
              0
            );
          }
        },
      });

      // Kill any existing animations
      gsap.killTweensOf([placeholder1, placeholder2]);

      // Add the animations to the timeline - animate the placeholders
      tl.to(
        placeholder1,
        {
          x: xDistance,
          y: yDistance,
          duration: swapItemDuration,
          ease: "power2.out",
        },
        0
      );
      tl.to(
        placeholder2,
        {
          x: -xDistance,
          y: -yDistance,
          duration: swapItemDuration,
          ease: "power2.out",
        },
        0
      );
    }
  };

  // Helper function to get image for item type
  const getItemImage = (type: number): string => {
    return items[type - 1] || items[0]; // Use items array, fallback to first item
  };

  const getRandomItemType = (): number => {
    // const specialItemChance = Math.floor(Math.random() * items.length) === 0; // modify special item appear chance
    // if (specialItemChance) {
    //   return specialItemType; // Return special item type
    // } else {
    //   let itemType = Math.floor(Math.random() * items.length) + 1; // Random type from 1 to items.length
    //   if (itemType === specialItemType) {
    //     itemType = getRandomItemType(); // Ensure we don't return special item type
    //   }
    //   return itemType;
    // }

    return Math.floor(Math.random() * items.length) + 1;
  };

  const cellSize = (390 - 12 - 12 - (width - 1) * 2) / width;

  useEffect(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }

    setHintCells(new Set());

    // Show hints only when board is stable and user is idle.
    if (
      disabled ||
      isFreezing ||
      board.length === 0 ||
      dragStart ||
      board.some((row) => row.some((cell) => cell.isMatched || cell.isNew))
    ) {
      return;
    }

    hintTimeoutRef.current = setTimeout(() => {
      const hintMove = findHintMove(board, holeCells);
      if (!hintMove) return;
      setHintCells(
        new Set([
          `${hintMove.row1},${hintMove.col1}`,
          `${hintMove.row2},${hintMove.col2}`,
        ])
      );
    }, 3500);

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, holeCells, isFreezing, disabled, dragStart]);

  return (
    <div
      className={styles.board}
      style={
        {
          "--board-height": height,
          "--board-width": width,
          margin: `0, calc(12 / 390 * 600px))`,
        } as React.CSSProperties
      }
    >
      {board.map((row, rowIndex) => (
        <Fragment key={rowIndex}>
          <div className={styles.row}>
            {row.map((item, colIndex) => (
              <Fragment key={`${rowIndex}-${colIndex}`}>
                {isHole(rowIndex, colIndex) ? (
                  <div
                    className={styles.holeCell}
                    style={{
                      width: `clamp(0px, calc(${cellSize} / 390 * 100vw), calc(${cellSize} / 390 * 600px))`,
                      height: `clamp(0px, calc(${cellSize} / 390 * 100vw), calc(${cellSize} / 390 * 600px))`,
                    }}
                  >
                    <img
                      src={gameConfig.assets.ui.holeCell}
                      alt=""
                      role="presentation"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                ) : (
                  <Cell
                    type={item.type}
                    isMatched={item.isMatched}
                    isNew={item.isNew}
                    isSelected={Boolean(
                      dragStart &&
                        dragStart.row === rowIndex &&
                        dragStart.col === colIndex
                    )}
                    isHinted={hintCells.has(`${rowIndex},${colIndex}`)}
                    row={rowIndex}
                    col={colIndex}
                    ref={(el: HTMLDivElement | null) =>
                      registerCellRef(rowIndex, colIndex, el)
                    }
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                    items={items}
                    cellSize={`clamp(0px, calc(${cellSize} / 390 * 100vw), calc(${cellSize} / 390 * 600px))`}
                  />
                )}
                {/* Add vertical separator between columns (except after last column) */}
                {colIndex < width - 1 && (
                  <div
                    className={styles.verticalSeparator}
                    style={{
                      height: `clamp(0px, calc(${cellSize} / 390 * 100vw), calc(${cellSize} / 390 * 600px))`,
                    }}
                  />
                )}
              </Fragment>
            ))}
          </div>
          {/* Add horizontal separator between rows (except after last row) */}
          {rowIndex < height - 1 && (
            <div
              className={styles.horizontalSeparator}
              style={{
                width: "100%",
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default Board;
