import { Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "./GameCheckInEndDialog.module.scss";
import AppImage from "@components/AppImage";
import { gameConfig } from "@config/gameConfig";

interface GameCheckInEndDialogProps {
  open: boolean;
  continuousCheckinCount: number;
  onNextEndDialog: () => void;
}

const GameEndDialog: React.FC<GameCheckInEndDialogProps> = ({
  open,
  continuousCheckinCount,
  onNextEndDialog,
}) => {
  const [checkInDayBox, setCheckInDayBox] = useState<string>(gameConfig.assets.ui.checkInDialogCheckInBox.day1);
  
  useEffect(() => {
    if (continuousCheckinCount === 1) {
      setCheckInDayBox(gameConfig.assets.ui.checkInDialogCheckInBox.day1);
    } else if (continuousCheckinCount === 2) {
      setCheckInDayBox(gameConfig.assets.ui.checkInDialogCheckInBox.day2);
    } else if (continuousCheckinCount === 3) {
      setCheckInDayBox(gameConfig.assets.ui.checkInDialogCheckInBox.day3);
    }
  });

  return (
    <Dialog open={open} className={styles.root}>
      <Typography align="center" className={styles.titleText}>
        Completed Day {continuousCheckinCount}
      </Typography>

      <AppImage
        src={checkInDayBox}
        alt="Landing round gift box"
        className={styles.checkInDayBox}
      />

      <Typography align="center" className={styles.contentText}>
        {  continuousCheckinCount === 1
          ? "2 more check-ins to earn extra rewards"
          : continuousCheckinCount === 2
            ? "1 more check-in to earn extra rewards"
            : "30 extra Gift Boxes earned! Enjoy!" }
        
      </Typography>

      <button type="button" className={styles.button} onClick={onNextEndDialog}>
        <AppImage
          src={gameConfig.assets.ui.okButton}
          alt="Play again button"
        />
      </button>
    </Dialog>
  );
};

export default GameEndDialog;
