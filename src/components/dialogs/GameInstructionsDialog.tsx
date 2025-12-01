import { Dialog, DialogContent } from "@mui/material";
import AppImage from "@components/AppImage";
import styles from "./GameInstructionsDialog.module.scss";
import { gameConfig } from "@config/gameConfig";
import Typography from "@mui/material/Typography";
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import { Pagination } from 'swiper/modules';

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
      <DialogContent>
        <Swiper
          spaceBetween={30}
          pagination={{
            clickable: true,
            el: "."+styles.instructionSwiperPagination,
            bulletActiveClass: styles.instructionSwiperPaginationBulletActive,
          }}
          modules={[Pagination]}
          className="instructionSwiper"
          observeParents={true}
        >
          <SwiperSlide data-hash="slide1">
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
              </div>

              <Typography align="center" className={styles.titleText}>
                Christmas Special
              </Typography>

              <AppImage
                  src={gameConfig.assets.ui.instructionsGiftNumSample}
                  alt="Instructions Gift Box Sample"
                  className={styles.instructionsGiftNumSample}
              />

              <Typography align="center" className={styles.contentText}>
                Special Christmas Gift Boxes will appear randomly. Grab the most Boxes to win exclusive rewards!
              </Typography>
            </div>
          </SwiperSlide>

          <SwiperSlide data-hash="slide2">
            <AppImage
              src={gameConfig.assets.ui.instructionsTitle}
              className={styles.titleImage}
              alt="Instructions title"
            />

            <div className={styles.contentContainer}>
              <div className={styles.animationContainer}>
                <AppImage
                  src={gameConfig.assets.ui.checkInDialogCheckInBox.day3}
                  alt="CheckInBox Day3"
                />
              </div>

              <Typography align="center" className={styles.titleText}>
                Daily Check-in Bonus
              </Typography>

              <Typography align="center" className={styles.contentText}>
                Check in for 3 consecutive days to receive 
                <span className={styles.brownText}> 30 extra Gift Boxes.</span>
              </Typography>
            </div>
          </SwiperSlide>

          <SwiperSlide data-hash="slide3">
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
              </div>

              <Typography align="center" className={styles.titleText}>
                Game Rules
              </Typography>

              <Typography align="center" className={styles.contentText}>
                Match 3 or more of the same item to eliminate them and earn points!
              </Typography>

              <div className={styles.animationContainer}>
                <AppImage
                  src={gameConfig.assets.ui.instructionsTimeBar}
                  alt="Instructions Time Bar"
                />
              </div>

              <Typography align="center" className={styles.contentText}>
                Match items to restore the timer. When time runs out, the game is over.
              </Typography>
            </div>
          </SwiperSlide>

          
        </Swiper>
        <div className={styles.instructionSwiperPagination}></div>
        <button type="button" className={styles.playButton} onClick={onPlay}>
          <AppImage
            src={gameConfig.assets.ui.playNowButton}
            alt="Play now button"
          />
        </button>
        
      </DialogContent>

      
    </Dialog>
  );
};

export default GameInstructionsDialog;
