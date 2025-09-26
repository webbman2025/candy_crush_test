import { Dialog } from "@mui/material";
import AppImage from "@components/AppImage";
import styles from "./GamePauseDialog.module.scss";
import { gameConfig } from "@config/gameConfig";

interface GamePauseDialogProps {
  open: boolean;
  audioOn: boolean;
  setAudioOn: (audioOn: boolean) => void;
  onResumeGame: () => void;
  onRestartGame: () => void;
  onBackToMenu: () => void;
}

const GamePauseDialog: React.FC<GamePauseDialogProps> = ({
  open,
  audioOn,
  setAudioOn,
  onResumeGame,
  onRestartGame,
  onBackToMenu,
}) => {
  return (
    <Dialog open={open} className={styles.root}>
      <div className={styles.controlsContainer}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={() => setAudioOn(!audioOn)}
        >
          {audioOn ? (
            <AppImage src={gameConfig.assets.ui.audioOnButton} alt="Audio on" />
          ) : (
            <AppImage
              src={gameConfig.assets.ui.audioOffButton}
              alt="Audio off"
            />
          )}
        </button>
      </div>

      <AppImage
        src={gameConfig.assets.ui.gamePausedTitle}
        className={styles.titleImage}
        alt="Game paused title"
      />

      <button type="button" className={styles.button} onClick={onResumeGame}>
        <AppImage
          src={gameConfig.assets.ui.resumeGameButton}
          alt="Resume game button"
        />
      </button>

      <button type="button" className={styles.button} onClick={onRestartGame}>
        <AppImage
          src={gameConfig.assets.ui.restartGameButton}
          alt="Restart game button"
        />
      </button>

      <button type="button" className={styles.button} onClick={onBackToMenu}>
        <AppImage
          src={gameConfig.assets.ui.backToMenuButton}
          alt="Back to menu button"
        />
      </button>
    </Dialog>
  );
};

export default GamePauseDialog;
