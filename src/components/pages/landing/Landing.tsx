import AppImage from "@components/AppImage";
import styles from "./Landing.module.scss";
import { gameConfig } from "@config/gameConfig";

interface LandingProps {
  audioOn: boolean;
  setAudioOn: (audioOn: boolean) => void;
  onPlay: () => void;
  onInstructions: () => void;
  onLeaderBoard: () => void;
}

const Landing: React.FC<LandingProps> = ({
  audioOn,
  setAudioOn,
  onPlay,
  onInstructions,
  onLeaderBoard,
}) => {
  return (
    <div className={styles.root}>
      <AppImage
        src={gameConfig.assets.ui.landingBackground}
        className={styles.backgroundImage}
        alt="Landing background"
      />

      {/* <AppImage
        src={gameConfig.assets.ui.landingBackgroundCloud1}
        className={styles.cloud1Image}
        alt="Landing Cloud 1"
      />

      <AppImage
        src={gameConfig.assets.ui.landingBackgroundCloud2}
        className={styles.cloud2Image}
        alt="Landing Cloud 2"
      />

      <AppImage
        src={gameConfig.assets.ui.landingBackgroundCloud3}
        className={styles.cloud3Image}
        alt="Landing Cloud 3"
      />

      <AppImage
        src={gameConfig.assets.ui.landingBackgroundPlane}
        className={styles.planeImage}
        alt="Landing Plane"
      /> */}

      <button
        type="button"
        className={styles.audioControlButton}
        onClick={() => setAudioOn(!audioOn)}
      >
        {audioOn ? (
          <AppImage src={gameConfig.assets.ui.audioOnButton} alt="Audio on" />
        ) : (
          <AppImage src={gameConfig.assets.ui.audioOffButton} alt="Audio off" />
        )}
      </button>

      <AppImage
        src={gameConfig.assets.ui.landingTitle}
        className={styles.titleImage}
        alt="Game title"
      />

      <button type="button" className={styles.playButton} onClick={onPlay}>
        <AppImage src={gameConfig.assets.ui.playButton} alt="Play button" />
      </button>

      <button className={styles.instructionsButton} onClick={onInstructions}>
        <AppImage
          src={gameConfig.assets.ui.instructionsButton}
          alt="Instructions button"
        />
      </button>

      <button className={styles.leaderboardButton} onClick={onLeaderBoard}>
        <AppImage
          src={gameConfig.assets.ui.leaderboardButton}
          alt="Leaderboard button"
        />
      </button>
    </div>
  );
};

export default Landing;
