import { Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
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
  specialItemMatchNum: number;
  specialItemTotalNum: number;
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
  specialItemMatchNum,
  specialItemTotalNum,
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

  const [tempTotalNum, setTempTotalNum ] = useState<number>(0);

  useEffect(() => {
    if (open) {
      console.log("OPEN GameEndDialogProps");
      console.log("specialItemMatchNum",specialItemMatchNum);
      console.log("specialItemTotalNum",specialItemTotalNum);
      setPersistedState({ score, bestScore, gamePoint });
      setTempTotalNum(specialItemTotalNum);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   setTimeout(function() {
  //     if (tempTotalNum < specialItemTotalNum) {
  //       setTempTotalNum(tempTotalNum+1);
  //     }
  //   }, 1000/specialItemMatchNum+1);
  // }, [tempTotalNum]);

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
        src={gameConfig.assets.ui.giftBoxIcon}
        className={styles.titleImage}
        alt="Game over title"
      />

      <Typography align="center" className={styles.titleText}>
        Your Gift box {formatNumberWithCommas(tempTotalNum)}
      </Typography>

      <div className={styles.resultContainer}>
        <AppImage
          src={gameConfig.assets.ui.endDialogGiftBoxBg}
          className={styles.resultContainerBg}
          alt="Game over title"
        />
        <div className={styles.infoTopContainer}>
          <Typography>Get Gift box</Typography>
          <div className={styles.giftNumberContainer}>
            <AppImage
              src={gameConfig.assets.ui.giftBoxIcon}
              alt="Landing round gift box"
              className={styles.giftBoxIcon}
            />
            <Typography className={styles.giftNumText}>
              +{formatNumberWithCommas(specialItemMatchNum)}
            </Typography>
          </div>
        </div>
        <div className={styles.infoBottomContainer}>
          <Typography>Your Score</Typography>
          <Typography style={{fontWeight: 700}}>
            {formatNumberWithCommas(persistedState.score)}
          </Typography>
        </div>
      </div>

      <button type="button" className={styles.button} onClick={onRestartGame}>
        <AppImage
          src={gameConfig.assets.ui.playAgainButton}
          alt="Play again button"
        />
      </button>
    </Dialog>
  );
};

export default GameEndDialog;
