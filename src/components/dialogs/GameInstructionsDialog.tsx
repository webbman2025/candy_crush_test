import { Dialog } from "@mui/material";
import AppImage from "@components/AppImage";
import styles from "./GameInstructionsDialog.module.scss";
import { gameConfig } from "@config/gameConfig";
import Typography from "@mui/material/Typography";

interface GameInstructionsDialogProps {
  open: boolean;
  onPlay: () => void;
  onClose: () => void;
}

const GameInstructionsDialog: React.FC<GameInstructionsDialogProps> = ({
  open,
  onPlay,
  onClose,
}) => {
  const handleClose = () => {
    // if (dontShowAgain) {
    //   localStorage.setItem("candyCrush_hideInstructions", "true");
    // }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      className={styles.root}
    >
      <AppImage
        src={gameConfig.assets.ui.instructionsTitle}
        className={styles.titleImage}
        alt="Instructions title"
      />

      <div className={styles.contentContainer}>
        <div className={styles.animationContainer}>
          <AppImage
            src={gameConfig.assets.ui.instructionsAnimation}
            alt="Instructions animation"
          />
          <AppImage
            src={gameConfig.assets.ui.instructionsTimeBar}
            alt="Instructions Time Bar"
          />
        </div>

        <Typography align="center" className={styles.contentText}>
          Match 3 or more of the same item to eliminate them and score points!
          <br/><br/>
          Matching gems will restore the timer below. When time runs out, the game is over
        </Typography>
      </div>

      <button type="button" className={styles.playButton} onClick={onPlay}>
        <AppImage
          src={gameConfig.assets.ui.playNowButton}
          alt="Play now button"
        />
      </button>
    </Dialog>
  );
};

export default GameInstructionsDialog;
