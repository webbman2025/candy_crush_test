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
  const [checkInDayTopBanner, setCheckInDayTopBanner] = useState<string>(gameConfig.assets.ui.checkInDialogCheckInTopBanner.day1);
  
  useEffect(() => {
    if (continuousCheckinCount === 1) {
      setCheckInDayBox(gameConfig.assets.ui.checkInDialogCheckInBox.day1);
      setCheckInDayTopBanner(gameConfig.assets.ui.checkInDialogCheckInTopBanner.day1);
    } else if (continuousCheckinCount === 2) {
      setCheckInDayBox(gameConfig.assets.ui.checkInDialogCheckInBox.day2);
      setCheckInDayTopBanner(gameConfig.assets.ui.checkInDialogCheckInTopBanner.day2);
    } else if (continuousCheckinCount === 3) {
      setCheckInDayBox(gameConfig.assets.ui.checkInDialogCheckInBox.day3);
      setCheckInDayTopBanner(gameConfig.assets.ui.checkInDialogCheckInTopBanner.day3);
    }
  });

  return (
    <Dialog open={open} className={styles.root}>
      <AppImage
        src={checkInDayTopBanner}
        className={styles.titleImage}
        alt="Instructions title"
      />
      
      <div className={styles.contentContainer}>
        <AppImage
          src={checkInDayBox}
          alt="Landing round gift box"
          className={styles.checkInDayBox}
        />

        <Typography align="center" className={styles.titleText}>
          Daily Check-in Bonus
        </Typography>
        
        <Typography align="center" className={styles.contentText}>
          { continuousCheckinCount === 1
            ? "2 more check-ins to earn"
            : continuousCheckinCount === 2
              ? "1 more check-in to earn"
              : "30 extra Gold Ingots earned! Enjoy!" }
        </Typography>

        <Typography align="center" className={styles.contentOtherText}>
          { continuousCheckinCount === 1 || continuousCheckinCount === 2
            ? "30 extra Gold Ingots." : "" }
        </Typography>
      </div>

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
