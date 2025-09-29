import GameEndDialog from "@components/dialogs/GameEndDialog";
import GamePauseDialog from "@components/dialogs/GamePauseDialog";
import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { formatNumberWithCommas } from "@utils/index";
import useSound from "@hooks/useSound";
import Board from "./Board";
import styles from "./Game.module.scss";
import AppImage from "@components/AppImage";
import { gameConfig } from "@config/gameConfig";
import { GameState } from "@/types/game";
import { useRouter } from "next/navigation";

interface GameProps {
  boardWidth: number;
  boardHeight: number;
  timeLimit: number;
  timeBonusPerMatch: number;
  gamePointBaseMinimumScore: number;
  gamePointBase: number;
  gamePointHighest: number;
  bestScore: number;
  items: string[];
  pointsPerItem: number;
  bonusPointsPerExtraMatch: number;
  comboMultipliers: {
    x2: number;
    x3: number;
    x4: number;
    superCombo: number;
  };
  comboPopupImages: {
    x2: string;
    x3: string;
    x4: string;
    x5: string;
  };
  audioOn: boolean;
  setAudioOn: (audioOn: boolean) => void;
  setBestScore: (bestScore: number) => void;
  onBackToMenu: () => void;
  fetchHighestScore: () => void;
}

const Game: React.FC<GameProps> = ({
  boardWidth = 8,
  boardHeight = 12,
  timeLimit = 60,
  timeBonusPerMatch = 1,
  // gamePointBaseMinimumScore = 20,
  // gamePointBase = 25,
  // gamePointHighest = 50,
  bestScore = 0,
  items = [],
  pointsPerItem = 10,
  bonusPointsPerExtraMatch = 20,
  comboMultipliers = { x2: 2, x3: 3, x4: 4, superCombo: 5 },
  comboPopupImages = { x2: "", x3: "", x4: "", x5: "" },
  audioOn,
  setAudioOn,
  setBestScore,
  onBackToMenu,
  fetchHighestScore,
}) => {
  const lastResumeTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  const bonusTimeRef = useRef<number>(0); // Track accumulated bonus time
  const comboCountRef = useRef(0);
  const highestComboRef = useRef(1); // Track highest combo in current chain
  const [comboPopup, setComboPopup] = useState<string | null>(null);
  const [comboPopupFading, setComboPopupFading] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Key to force board remount on restart
  const [isCriticalTime, setIsCriticalTime] = useState(false); // Track if we're in critical time state for showing red bar glowing effect
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: timeLimit * 1000, // in ms
    isGameOver: false,
    isPaused: false,
  });

  const [openPauseDialog, setOpenPauseDialog] = useState(false);
  const [openEndDialog, setOpenEndDialog] = useState(false);

  const audioOnRef = useRef(audioOn);

  // Sound effects
  const gameOverSound = useSound(gameConfig.sounds.effects.gameOver.path, {
    volume: gameConfig.sounds.effects.gameOver.volume,
  });
  const pauseSound = useSound(gameConfig.sounds.effects.pause.path, {
    volume: gameConfig.sounds.effects.pause.volume,
  });
  const comboX2Sound = useSound(gameConfig.sounds.combo.x2.path, {
    volume: gameConfig.sounds.combo.x2.volume,
  });
  const comboX3Sound = useSound(gameConfig.sounds.combo.x3.path, {
    volume: gameConfig.sounds.combo.x3.volume,
  });
  const comboX4Sound = useSound(gameConfig.sounds.combo.x4.path, {
    volume: gameConfig.sounds.combo.x4.volume,
  });
  const comboSuperSound = useSound(gameConfig.sounds.combo.super.path, {
    volume: gameConfig.sounds.combo.super.volume,
  });

  useEffect(() => {
    audioOnRef.current = audioOn;
  }, [audioOn]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !gameState.isPaused && !gameState.isGameOver) {
        togglePause();
      }
    };

    const handlePageHide = () => {
      if (!gameState.isPaused && !gameState.isGameOver) {
        togglePause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [gameState.isPaused, gameState.isGameOver]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!gameState.isGameOver && !gameState.isPaused) {
      timer = setInterval(() => {
        const now = Date.now();
        const currentSessionTime = now - lastResumeTimeRef.current;
        const totalElapsedTime = accumulatedTimeRef.current + currentSessionTime; // prettier-ignore
        const newTimeLeft = Math.max(
          0,
          Math.min(
            timeLimit * 1000,
            timeLimit * 1000 - totalElapsedTime + bonusTimeRef.current
          )
        ); // Cap at original time limit
        setGameState((prev: GameState) => ({
          ...prev,
          timeLeft: newTimeLeft,
          isGameOver: newTimeLeft <= 0,
        }));

        const timePercentage = (newTimeLeft / (timeLimit * 1000)) * 100;
        setIsCriticalTime(
          timePercentage <= gameConfig.time.barThresholds.red &&
            timePercentage > 0 &&
            !gameState.isGameOver
        );
      }, 10);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isGameOver, gameState.isPaused, timeLimit]);

  useEffect(() => {
    if (gameState.isGameOver) {
      // Play game over sound
      if (audioOnRef.current) {
        gameOverSound.play();
      }

      // Check if current score beats the best score and update it
      if (gameState.score > bestScore) {
        setBestScore(gameState.score);
      }
      setOpenEndDialog(true);
    }
  }, [
    gameState.isGameOver,
    gameState.score,
    bestScore,
    setBestScore,
    gameOverSound,
  ]);

  const handleMatchScore = (matchedCount: number) => {
    const basePoints = matchedCount * pointsPerItem;

    // Bonus points for matches larger than 3
    const bonusPoints =
      matchedCount > 3 ? (matchedCount - 3) * bonusPointsPerExtraMatch : 0;

    // Calculate combo multiplier using current combo count
    let comboMultiplier = 1;
    const currentCombo = comboCountRef.current;
    if (currentCombo >= 1) {
      if (currentCombo === 1) comboMultiplier = comboMultipliers.x2;
      else if (currentCombo === 2) comboMultiplier = comboMultipliers.x3;
      else if (currentCombo === 3) comboMultiplier = comboMultipliers.x4;
      else comboMultiplier = comboMultipliers.superCombo; // 5x or higher
    }

    // Track the highest combo achieved in this chain
    if (comboMultiplier > highestComboRef.current) {
      highestComboRef.current = comboMultiplier;
    }

    const totalPoints = (basePoints + bonusPoints) * comboMultiplier;

    // Debug logging
    console.log(
      `Match ${
        currentCombo + 1
      }: ${matchedCount} items, combo x${comboMultiplier}, score: ${totalPoints}`
    );

    // Increment combo for next potential match
    comboCountRef.current += 1;

    // Add bonus time to the ref so it persists through timer updates
    // Use timeBonusPerMatch as base unit multiplied by combo multiplier
    bonusTimeRef.current += comboMultiplier * timeBonusPerMatch * 1000;

    setGameState((prev: GameState) => ({
      ...prev,
      score: prev.score + totalPoints,
      // timeLeft will be updated by the timer with bonus included
    }));
  };

  const resetCombo = () => {
    console.log("Combo reset");

    // Show popup for the highest combo achieved (only if > 1)
    if (highestComboRef.current > 1) {
      let popupImage = "";
      let sound = null;
      if (highestComboRef.current === 2) {
        popupImage = comboPopupImages.x2;
        sound = comboX2Sound;
      } else if (highestComboRef.current === 3) {
        popupImage = comboPopupImages.x3;
        sound = comboX3Sound;
      } else if (highestComboRef.current === 4) {
        popupImage = comboPopupImages.x4;
        sound = comboX4Sound;
      } else {
        popupImage = comboPopupImages.x5;
        sound = comboSuperSound;
      }

      if (audioOnRef.current && sound) {
        sound.play();
      }

      console.log(`Showing combo popup for x${highestComboRef.current}`);
      setComboPopup(popupImage);
      setComboPopupFading(false);

      // Start fade-out animation after 600ms
      setTimeout(() => {
        setComboPopupFading(true);
      }, 600);

      // Hide popup after fade-out animation completes (600ms + 300ms fade)
      setTimeout(() => {
        setComboPopup(null);
        setComboPopupFading(false);
      }, 900);
    }

    // Reset both counters
    comboCountRef.current = 0;
    highestComboRef.current = 1;
  };

  const restartGame = () => {
    const now = Date.now();
    lastResumeTimeRef.current = now;
    accumulatedTimeRef.current = 0;
    bonusTimeRef.current = 0; // Reset bonus time
    comboCountRef.current = 0;
    highestComboRef.current = 1;
    fetchHighestScore(); // Fetch highest score from server
    setComboPopup(null);
    setComboPopupFading(false);
    setIsCriticalTime(false); // Reset critical time state
    setGameState({
      score: 0,
      timeLeft: timeLimit * 1000,
      isGameOver: false,
      isPaused: false,
    });

    setOpenPauseDialog(false);
    setOpenEndDialog(false);
    setGameKey((prev) => prev + 1); // Increment key to force board remount and shuffle
  };

  const togglePause = () => {
    setGameState((prev: GameState) => {
      const now = Date.now();

      if (prev.isPaused) {
        // Resuming: reset the resume time to now
        lastResumeTimeRef.current = now;
      } else {
        // Pausing: update accumulated time based on current timeLeft
        // Calculate elapsed time considering both original time and bonus time
        const totalAvailableTime = timeLimit * 1000 + bonusTimeRef.current;
        const elapsedTime = totalAvailableTime - prev.timeLeft;
        accumulatedTimeRef.current = elapsedTime;

        // Play pause sound when pausing
        if (audioOnRef.current) {
          pauseSound.play();
        }
      }

      return {
        ...prev,
        isPaused: !prev.isPaused,
      };
    });

    setOpenPauseDialog(!openPauseDialog);
  };

  // Calculate game points based on score
  // const calculateGamePoints = (score: number): number => {
  //   if (score > bestScore) {
  //     return gamePointHighest; // 50 points for beating best score
  //   } else if (score >= gamePointBaseMinimumScore) {
  //     return gamePointBase; // 25 points for reaching minimum score
  //   } else {
  //     return 0; // No points
  //   }
  // };

  const timePercentage = (gameState.timeLeft / (timeLimit * 1000)) * 100;
  const showBlueBar = false;
  const showYellowBar = timePercentage >= gameConfig.time.barThresholds.yellow;
  const showRedBar = timePercentage < gameConfig.time.barThresholds.red;

  const router = useRouter();

  const handleLeaderBoard = () => {
    router.push("/leaderboard.jsp?req_d=my3");
  };

  return (
    <div className={styles.root}>
      <AppImage
        src={gameConfig.assets.ui.gameBackground}
        className={styles.backgroundImage}
        alt="Game background"
      />

      <div className={styles.gameContainer}>
        <div className={styles.topBarContainer}>
          <AppImage src={gameConfig.assets.ui.topBar} alt="Top bar" />

          <div className={styles.topBarBestScoreContainer}>
            <Typography className={styles.scoreText}>
              {formatNumberWithCommas(bestScore)}
            </Typography>
          </div>

          <div className={styles.topBarScoreContainer}>
            <Typography className={styles.scoreText}>
              {formatNumberWithCommas(gameState.score)}
            </Typography>
          </div>

          <button
            type="button"
            className={styles.pauseButton}
            onClick={togglePause}
          />
        </div>

        <div className={styles.boardWrapper}>
          {/* {gameState.isGameOver ? (
            <div className={styles.gameOver}>
              <Typography variant="h4" gutterBottom>
                Game Over!
              </Typography>
              <Typography variant="h5">
                Final Score: {formatNumberWithCommas(gameState.score)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={restartGame}
                size="large"
                className={styles.playAgainButton}
              >
                Play Again
              </Button>
            </div>
          ) : ( */}
          <div
            className={`${styles.boardContainer} ${
              gameState.isPaused ? styles.pausedOverlay : ""
            }`}
          >
            {gameState.isPaused && (
              <Typography variant="h4" className={styles.pausedText}>
                PAUSED
              </Typography>
            )}
            <Board
              width={boardWidth}
              height={boardHeight}
              audioOn={audioOn}
              onMatch={gameState.isGameOver ? () => {} : handleMatchScore}
              onResetCombo={gameState.isGameOver ? () => {} : resetCombo}
              items={items}
              disabled={gameState.isGameOver}
              key={gameKey}
            />

            {/* Combo Popup */}
            {comboPopup && !gameState.isGameOver && (
              <div
                className={`${styles.comboPopup} ${
                  comboPopupFading ? styles.comboPopupFading : ""
                }`}
              >
                <AppImage
                  src={comboPopup}
                  alt="Combo"
                  className={styles.comboPopupImage}
                />
              </div>
            )}
          </div>
          {/* )} */}
        </div>

        <div className={styles.timeBarContainer}>
          <AppImage
            src={gameConfig.assets.ui.timeBarBackground}
            className={styles.timeBarBackgroundImage}
            alt="Time bar background"
          />

          <div
            className={styles.timeBarProgressContainer}
            style={{
              clipPath: `inset(0 ${
                100 - (gameState.timeLeft / (timeLimit * 1000)) * 100
              }% 0 0)`,
            }}
          >
            {/* Invisible placeholder to maintain container height */}
            <AppImage
              src={gameConfig.assets.ui.timeBarBlue}
              className={styles.timeBarProgressImage}
              style={{ opacity: 0, visibility: "hidden" }}
              alt=""
            />

            {/* Blue time bar - visible when > 50% */}
            <AppImage
              src={gameConfig.assets.ui.timeBarBlue}
              className={`${styles.timeBarProgressImage} ${styles.timeBarBlue}`}
              style={{
                opacity: showBlueBar ? 1 : 0,
              }}
              alt="Blue time bar"
            />

            {/* Yellow time bar - visible when 20-50% */}
            <AppImage
              src={gameConfig.assets.ui.timeBarYellow}
              className={`${styles.timeBarProgressImage} ${styles.timeBarYellow}`}
              style={{
                opacity: showYellowBar ? 1 : 0,
              }}
              alt="Yellow time bar"
            />

            {/* Red time bar - visible when < 20% */}
            <AppImage
              src={gameConfig.assets.ui.timeBarRed}
              className={`${styles.timeBarProgressImage} ${styles.timeBarRed} ${
                showRedBar && isCriticalTime ? styles.timeBarFlashing : ""
              }`}
              style={{
                opacity: showRedBar ? 1 : 0,
              }}
              alt="Red time bar"
            />
          </div>
        </div>
      </div>

      <GamePauseDialog
        open={openPauseDialog}
        audioOn={audioOn}
        setAudioOn={setAudioOn}
        onResumeGame={togglePause}
        onRestartGame={restartGame}
        onBackToMenu={onBackToMenu}
      />

      <GameEndDialog
        open={openEndDialog}
        audioOn={audioOn}
        score={gameState.score}
        bestScore={bestScore}
        // gamePoint={calculateGamePoints(gameState.score)}
        gamePoint={0}
        onBackToMenu={onBackToMenu}
        setAudioOn={setAudioOn}
        onRestartGame={restartGame}
        onLeaderboard={handleLeaderBoard}
      />

      {/* Preload combo popup images - invisible placeholders for caching */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <AppImage src={comboPopupImages.x2} alt="" />
        <AppImage src={comboPopupImages.x3} alt="" />
        <AppImage src={comboPopupImages.x4} alt="" />
        <AppImage src={comboPopupImages.x5} alt="" />
      </div>
    </div>
  );
};

export default Game;
