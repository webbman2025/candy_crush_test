import React, { forwardRef } from "react";
import AppImage from "@components/AppImage";
import styles from "./Cell.module.scss";
import { gameConfig } from "@config/gameConfig";

interface CellProps {
  type: number;
  isMatched: boolean;
  isNew?: boolean;
  isSelected: boolean;
  row: number;
  col: number;
  onDragStart: (row: number, col: number) => void;
  onDragEnter: (row: number, col: number) => void;
  onDragEnd: () => void;
  items: string[];
  cellSize: string;
}

const Cell = forwardRef<HTMLDivElement, CellProps>(
  (
    {
      type,
      isMatched,
      isNew = false,
      isSelected,
      row,
      col,
      onDragStart,
      onDragEnter,
      onDragEnd,
      items,
      cellSize,
    },
    ref
  ) => {
    const getItemImage = (type: number) => {
      return items[type - 1] || items[0]; // Use items array, fallback to first item
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      onDragStart(row, col);
    };

    const handleTouchStart = () => {
      onDragStart(row, col);
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
      if (e.buttons === 1) {
        // Left mouse button is pressed
        onDragEnter(row, col);
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      // Get touch position
      const touch = e.touches[0];
      const element = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      ) as HTMLElement;

      // If the touch is over a different cell
      if (element && element !== e.currentTarget) {
        const cellElement = element.closest(`.${styles.cell}`);
        if (cellElement) {
          const dataRow = cellElement.getAttribute("data-row");
          const dataCol = cellElement.getAttribute("data-col");

          if (dataRow !== null && dataCol !== null) {
            onDragEnter(parseInt(dataRow), parseInt(dataCol));
          }
        }
      }
    };

    const handleMouseUp = () => {
      onDragEnd();
    };

    const handleTouchEnd = () => {
      onDragEnd();
    };

    const className = `${styles.cell} ${isMatched ? styles.matched : ""} ${
      isNew ? styles.newItem : ""
    } ${
      isSelected ? styles.selected : ""
    }`;

    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: cellSize,
          height: cellSize,
        }}
        data-row={row}
        data-col={col}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        draggable={false}
        role="button"
        tabIndex={0}
        aria-label={`Item ${type}`}
      >
        <AppImage
          src={getItemImage(type)}
          alt={`Item ${type}`}
          className={styles.itemImage}
        />

        {/* Highlight border - appears when matched */}
        {isMatched && (
          <AppImage
            src={gameConfig.assets.ui.itemHighlightBorder}
            alt="Highlight border"
            className={styles.highlightBorder}
          />
        )}

        {/* Highlight star - appears when matched */}
        {isMatched && (
          <AppImage
            src={gameConfig.assets.ui.itemHighlightStar}
            alt="Highlight star"
            className={styles.highlightStar}
          />
        )}
      </div>
    );
  }
);

Cell.displayName = "Cell";

export default Cell;
