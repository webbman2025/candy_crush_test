import AppImage from "@components/AppImage";
import styles from "./Landing.module.scss";
import { gameConfig } from "@config/gameConfig";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { formatNumberWithCommas } from "@utils/index";
import 'swiper/css';
import 'swiper/css/pagination';


interface LandingProps {
  audioOn: boolean;
  continuousCheckinCount: number;
  specialItemPoint: number;
  setAudioOn: (audioOn: boolean) => void;
  onPlay: () => void;
  onInstructions: () => void;
  onLeaderBoard: () => void;
  onEventDetails: () => void;
}

const Landing: React.FC<LandingProps> = ({
  audioOn,
  continuousCheckinCount,
  specialItemPoint,
  setAudioOn,
  onPlay,
  onInstructions,
  onLeaderBoard,
  onEventDetails,
}) => {
  const [checkInDayBox, setCheckInDayBox] = useState<string>(gameConfig.assets.ui.landingUserGameInfoBox.day0);

  useEffect(() => {
    if (continuousCheckinCount === 0) {
      setCheckInDayBox(gameConfig.assets.ui.landingUserGameInfoBox.day0);
    } else if (continuousCheckinCount === 1) {
      setCheckInDayBox(gameConfig.assets.ui.landingUserGameInfoBox.day1);
    } else if (continuousCheckinCount === 2) {
      setCheckInDayBox(gameConfig.assets.ui.landingUserGameInfoBox.day2);
    } else if (continuousCheckinCount === 3) {
      setCheckInDayBox(gameConfig.assets.ui.landingUserGameInfoBox.day3);
    }
  });

  return (
    <div className={styles.root}>
      <AppImage
        src={gameConfig.assets.ui.landingBackground}
        className={styles.backgroundImage}
        alt="Landing background"
      />

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

      <AppImage
        src={gameConfig.assets.ui.landingEventDetails}
        className={styles.landingEventDetails}
        alt="Landing Event Details"
      />

      <button
        type="button"
        className={styles.eventDetailsButton}
        onClick={onEventDetails}
      />
      
      <div className={styles.landingRoundGiftBoxRow}>
        <div className={styles.landingRoundGiftBoxLeftContainer}>
          <AppImage
            src={gameConfig.assets.ui.landingRoundGiftBox}
            alt="Landing round gift box"
            className={styles.landingRoundGiftBox}
          />

          <Typography align="center" className={styles.contentText}>
            Round 1<br/>1-18 Dec
          </Typography>

          <button type="button" className={styles.roundPlayButton}>
            <AppImage src={gameConfig.assets.ui.finishedButton} alt="Play button" />
          </button>
        </div>
        
        <div className={styles.landingRoundGiftBoxRightContainer}>
          <AppImage
            src={gameConfig.assets.ui.landingRoundGiftBox}
            alt="Landing round gift box"
            className={styles.landingRoundGiftBox}
          />

          <Typography align="center" className={styles.contentText}>
            Round 2<br/>19 Dec - 5 Jan
          </Typography>

          <button type="button" className={styles.roundPlayButton} onClick={onPlay}>
            <AppImage src={gameConfig.assets.ui.playButton} alt="Play button" />
          </button>
        </div>
      </div>

      <div className={styles.landingUserGameInfoBox}>
        <AppImage
          src={checkInDayBox}
          alt="Landing round gift box"
        />

        <Typography align="center" className={styles.infoBoxDateText}>
          (19 Dec - 5 Jan)
        </Typography>

        <div className={styles.landingUserGameGiftNumberContainer}>
          <AppImage
            src={gameConfig.assets.ui.giftBoxIcon}
            alt="Landing round gift box"
            className={styles.giftBoxIcon}
          />
          <Typography className={styles.giftNumText}>
            {formatNumberWithCommas(specialItemPoint)}
          </Typography>
        </div>
      </div>

      <button className={styles.instructionsButton} onClick={onInstructions}>
        <AppImage
          src={gameConfig.assets.ui.instructionsButton}
          alt="Instructions button"
        />
      </button>

    </div>
  );
};

export default Landing;
