// ==========================================
// CANDY CRUSH GAME CONFIGURATION
// ==========================================
// This file centralizes all game settings for easy adjustment

const basePath = process.env.NEXT_PUBLIC_ASSET_BASE_PATH ?? "";

export const gameConfig = {
  basePath,
  // ==========================================
  // API CONFIGURATION
  // ==========================================

  campaignID: "gamehub",
  campaignName: "candy-crush-cny",

  // ==========================================
  // BOARD CONFIGURATION
  // ==========================================
  board: {
    width: 8,
    height: 9,
  },

  // ==========================================
  // TIME CONFIGURATION
  // ==========================================
  time: {
    limit: 60, // seconds
    bonusPerMatch: 1, // seconds added per match

    // Time bar color thresholds (percentage)
    barThresholds: {
      blue: 50, // Blue bar shows when > 50%
      yellow: 20, // Yellow bar shows when 20% - 50%
      red: 20, // Red bar shows when < 20% (also triggers flashing)
    },
  },

  // ==========================================
  // SCORING CONFIGURATION
  // ==========================================
  scoring: {
    // Base scoring: Each matched item = pointsPerItem points
    // Bonus scoring: For matches > 3 items, each extra item = bonusPointsPerExtraMatch points
    // Examples:
    //   - 3-match: 3 × 1 + 0 bonus = 3 points
    //   - 4-match: 4 × 1 + (4-3) × 2 = 6 points
    //   - 5-match: 5 × 1 + (5-3) × 2 = 9 points
    //   - 6-match: 6 × 1 + (6-3) × 2 = 12 points
    pointsPerItem: 1,
    bonusPointsPerExtraMatch: 2,

    // Game point rewards
    gamePointBaseMinimumScore: 20,
    gamePointBase: 25,
    gamePointHighest: 50,
  },

  // ==========================================
  // COMBO CONFIGURATION
  // ==========================================
  combo: {
    // Combo scoring: Consecutive chain matches get multiplier bonuses
    // Formula: (basePoints + bonusPoints) × comboMultiplier
    // Examples with 4-match (4 × 1 + 1 × 2 = 6 base points):
    //   - 1st match: 6 × 1 = 6 points (no combo)
    //   - 2nd consecutive match (combo x2): 6 × 2 = 12 points
    //   - 3rd consecutive match (combo x3): 6 × 3 = 18 points
    //   - 4th consecutive match (combo x4): 6 × 4 = 24 points
    //   - 5th+ consecutive match (super combo): 6 × 5 = 30 points
    multipliers: {
      x2: 2,
      x3: 3,
      x4: 4,
      superCombo: 5, // 5x or higher combos
    },
  },

  // ==========================================
  // SOUND CONFIGURATION
  // ==========================================
  sounds: {
    // Background music
    background: {
      path: `${basePath}/sounds/background.mp3`,
      volume: 0.5,
    },

    // Game effect sounds
    effects: {
      gameOver: {
        path: `${basePath}/sounds/gameover.wav`,
        volume: 1.0,
      },
      pause: {
        path: `${basePath}/sounds/pause.wav`,
        volume: 1.0,
      },
      match: {
        path: `${basePath}/sounds/match.wav`,
        volume: 1.0,
      },
      swap: {
        path: `${basePath}/sounds/swap.wav`,
        volume: 1.0,
      },
      spawn: {
        path: `${basePath}/sounds/spawn.wav`,
        volume: 1.0,
      },
    },

    // Combo sounds (note: currently empty files, need actual audio content)
    combo: {
      x2: {
        path: `${basePath}/sounds/combo-x2.wav`,
        volume: 1.0,
      },
      x3: {
        path: `${basePath}/sounds/combo-x3.wav`,
        volume: 1.0,
      },
      x4: {
        path: `${basePath}/sounds/combo-x4.wav`,
        volume: 1.0,
      },
      super: {
        path: `${basePath}/sounds/combo-super.wav`,
        volume: 1.0,
      },
    },
  },

  // ==========================================
  // VISUAL ASSETS CONFIGURATION
  // ==========================================
  assets: {
    // Game item variants
    items: [
      `${basePath}/images/items-new-year-goldmoney.png`,
      `${basePath}/images/items-new-year-80k.png`,
      `${basePath}/images/items-new-year-chong.png`,
      `${basePath}/images/items-new-year-dice.png`,
      `${basePath}/images/items-new-year-fat.png`,
      `${basePath}/images/items-new-year-horse.png`,
      `${basePath}/images/items-new-year-lucky.png`,
      //`${basePath}/images/items-pumpkin.png`,
      //`${basePath}/images/items-ghost.png`,
      //`${basePath}/images/items-empiremouth.png`,
      //`${basePath}/images/items-mushroom.png`,
      //`${basePath}/images/items-poison.png`,
      //`${basePath}/images/items-black-candy.png`,
      //`${basePath}/images/items-starfish.png`,
      // `${basePath}/images/items-palm-tree.png`,
      // `${basePath}/images/items-hat.png`,
    ],

    // Combo popup images
    comboPopups: {
      x2: `${basePath}/images/game-combo-x2.png`,
      x3: `${basePath}/images/game-combo-x3.png`,
      x4: `${basePath}/images/game-combo-x4.png`,
      x5: `${basePath}/images/game-combo-super.png`, // for 5x and higher
    },

    // UI images
    ui: {
      // Game screen
      gameBackground: `${basePath}/images/game-background.png`,
      topBar: `${basePath}/images/game-top-bar.png`,
      timeBarBackground: `${basePath}/images/time-bar-bg.png`,
      timeBarBlue: `${basePath}/images/time-bar-blue.png`,
      timeBarYellow: `${basePath}/images/time-bar-yellow.png`,
      timeBarRed: `${basePath}/images/time-bar-red.png`,

      // Landing screen
      landingBackground: `${basePath}/images/landing-bg.png`,
      landingBackgroundCloud1: `${basePath}/images/travel-bg-cloud-1.png`,
      landingBackgroundCloud2: `${basePath}/images/travel-bg-cloud-2.png`,
      landingBackgroundCloud3: `${basePath}/images/travel-bg-cloud-3.png`,
      landingBackgroundPlane: `${basePath}/images/travel-bg-plane.png`,
      landingTitle: `${basePath}/images/landing-title.png`,
      landingEventDetails: `${basePath}/images/landing-event-details.png`,
      landingRoundGiftBox: `${basePath}/images/landing-round-gift-box.png`,
      landingUserGameInfoBox: {
        day0:  `${basePath}/images/landing-user-game-info-box-day-0.png`,
        day1:  `${basePath}/images/landing-user-game-info-box-day-1.png`,
        day2:  `${basePath}/images/landing-user-game-info-box-day-2.png`,
        day3:  `${basePath}/images/landing-user-game-info-box-day-3.png`,
      },

      // Buttons
      audioOnButton: `${basePath}/images/audio-on-button.png`,
      audioOffButton: `${basePath}/images/audio-off-button.png`,
      playButton: `${basePath}/images/play-button.png`,
      playNowButton: `${basePath}/images/play-now-button.png`,
      playAgainButton: `${basePath}/images/play-again-button.png`,
      instructionsButton: `${basePath}/images/instructions-button.png`,
      leaderboardButton: `${basePath}/images/leaderboard-button.png`,
      menuButton: `${basePath}/images/menu-button.png`,
      resumeGameButton: `${basePath}/images/resume-game-button.png`,
      restartGameButton: `${basePath}/images/restart-game-button.png`,
      backToMenuButton: `${basePath}/images/back-to-menu-button.png`,
      randomPrizeButton: `${basePath}/images/random-prize-btn.png`,
      coomingSoonButton: `${basePath}/images/coming-soon-button.png`,
      okButton: `${basePath}/images/ok-button.png`,
      finishedButton: `${basePath}/images/finished-button.png`,

      // Dialog titles
      gameOverTitle: `${basePath}/images/game-over-title.png`,
      gamePausedTitle: `${basePath}/images/game-paused-title.png`,
      instructionsTitle: `${basePath}/images/instructions-title.png`,

      // Game elements
      itemHighlightBorder: `${basePath}/images/item-highlight-border.png`,
      itemHighlightStar: `${basePath}/images/item-highlight-star.png`,
      gamePoints: `${basePath}/images/game-points.png`,
      instructionsAnimation: `${basePath}/images/instructions-animation.gif`,
      instructionsTimeBar: `${basePath}/images/instructions-time-bar.png`,
      instructionsGiftNumSample: `${basePath}/images/instructions-gift-num-sample.png`,
      
      checkInDialogCheckInBox: {
        day1:  `${basePath}/images/check-in-box-day-1.png`,
        day2:  `${basePath}/images/check-in-box-day-2.png`,
        day3:  `${basePath}/images/check-in-box-day-3.png`,
      },

      checkInDialogCheckInTopBanner: {
        day1:  `${basePath}/images/check-in-box-day-1-top-banner.png`,
        day2:  `${basePath}/images/check-in-box-day-2-top-banner.png`,
        day3:  `${basePath}/images/check-in-box-day-3-top-banner.png`,
      },

      giftBoxIcon: `${basePath}/images/xmas-giftbox.png`,

      gameBottomGiftNumBar: `${basePath}/images/game-bottom-gift-num-bar.png`,

      endDialogGiftBoxBg: `${basePath}/images/end-dialog-gift-box-bg.png`,

      landingBackgroundBottom: `${basePath}/images/game-bg-bottom.png`,
    },
  },
};
