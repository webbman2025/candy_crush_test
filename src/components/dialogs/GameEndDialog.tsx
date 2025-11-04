import { Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./GameEndDialog.module.scss";
import { formatNumberWithCommas } from "@utils/index";
import AppImage from "@components/AppImage";
import { gameConfig } from "@config/gameConfig";

interface GameEndDialogProps {
  open: boolean;
  audioOn: boolean;
  score: number;
  bestScore: number;
  gamePoint: number;
  setAudioOn: (audioOn: boolean) => void;
  onBackToMenu: () => void;
  onRestartGame: () => void;
  onLeaderboard: () => void;
}

const GameEndDialog: React.FC<GameEndDialogProps> = ({
  open,
  audioOn,
  score,
  bestScore,
  gamePoint,
  setAudioOn,
  onBackToMenu,
  onRestartGame,
  onLeaderboard,
}) => {
  const [persistedState, setPersistedState] = useState<{
    score: number;
    bestScore: number;
    gamePoint: number;
  }>({
    score,
    bestScore,
    gamePoint,
  });

  useEffect(() => {
    if (open) {
      setPersistedState({ score, bestScore, gamePoint });

      // Submit score to API when game ends
      const submitScore = async () => {
        try {
          const response = await axios.post(
            "/3Care/GamifyAcquirePoint.do",
            {
              campaignID: "gamehub",
              name: "candy-crush",
              action: "game",
              point: gamePoint,
              score: score,
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
              }
            }
          );
          if (response.data && response.data.code === 200) {
            console.log("Score submitted successfully:", response.data);
          } else {
            console.warn("API returned non-success code:", response.data);
          }
        } catch (error) {
          console.error("Error submitting score:", error);
        }
      };

      submitScore();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} className={styles.root}>
      <div className={styles.controlsContainer}>
        <button
          type="button"
          className={styles.controlButton}
          onClick={onBackToMenu}
        >
          <AppImage src={gameConfig.assets.ui.menuButton} alt="Menu button" />
        </button>

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
        src={gameConfig.assets.ui.gameOverTitle}
        className={styles.titleImage}
        alt="Game over title"
      />

      <div className={styles.resultContainer}>
        <div>
          <Typography>Your Score</Typography>
          <Typography>
            {formatNumberWithCommas(persistedState.score)}
          </Typography>
        </div>
        <div>
          <Typography>Your Highest Score</Typography>
          <Typography>
            {formatNumberWithCommas(
              Math.max(persistedState.score, persistedState.bestScore)
            )}
          </Typography>
        </div>
      </div>

      <button type="button" className={styles.button} onClick={onRestartGame}>
        <AppImage
          src={gameConfig.assets.ui.playAgainButton}
          alt="Play again button"
        />
      </button>

      <button type="button" className={styles.button} onClick={onLeaderboard}>
        <AppImage
          src={gameConfig.assets.ui.leaderboardButton}
          alt="Leaderboard button"
        />
      </button>
    </Dialog>
  );
};

export default GameEndDialog;
