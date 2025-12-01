"use client";

import { Box } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Landing from "@components/pages/landing/Landing";
import Game from "@components/pages/game/Game";
import GameInstructionsDialog from "@components/dialogs/GameInstructionsDialog";
import { gameConfig } from "@config/gameConfig";
import { useRouter } from "next/navigation";

// Configuration - now imported from centralized config
const { board, time, scoring, combo, assets } = gameConfig;
const { width: boardWidth, height: boardHeight } = board;
const { limit: timeLimit, bonusPerMatch: timeBonusPerMatch } = time;
const {
  pointsPerItem,
  bonusPointsPerExtraMatch,
  gamePointBaseMinimumScore,
  gamePointBase,
  gamePointHighest,
} = scoring;
const { multipliers: comboMultipliers } = combo;
const { items, comboPopups: comboPopupImages } = assets;
const { sounds } = gameConfig;

export default function Home() {
  const [page, setPage] = useState<"landing" | "game" | "result">("landing");
  const [audioOn, setAudioOn] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [openInstructionsDialog, setOpenInstructionsDialog] = useState(false);
  const [isCriticalTime, setIsCriticalTime] = useState(false);
  const [continuousCheckinCount, setContinuousCheckinCount] = useState(0);
  const [specialItemPoint, setSpecialItemPoint] = useState(0);
  const [checkInToday, setCheckInToday] = useState(false);
  const [tempSpecialItemPoint, setTempSpecialItemPoint] = useState(specialItemPoint); // Key to force board remount on restart


  // Audio Context setup with useRef to persist across renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const shouldBePlayingRef = useRef<boolean>(false); // Track if audio should be playing
  const isRedirectedToPlay = useRef<boolean>(false);
  

  window.onload = () => {
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // Initialize AudioContext and load audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create AudioContext
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Create gain node for volume control
        let tempBackgroundSound = sounds.background;
        if (page == "game") {
          tempBackgroundSound = sounds.background;
        }
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = tempBackgroundSound.volume;
        gainNodeRef.current.connect(audioContextRef.current.destination);

        // Load and decode audio file
        const response = await fetch(tempBackgroundSound.path);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(
          arrayBuffer
        );

        controlAudio();
      } catch (error) {
        console.warn("Failed to initialize audio:", error);
      }
    };
    
    initAudio();

    // Cleanup on unmount
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [page]);

  // Disable mobile browser zoom
  useEffect(() => {
    document.body.style.zoom = "1";
    const eventListener = (e: any) => {
      e.preventDefault();
      // special hack to prevent zoom-to-tabs gesture in safari
      document.body.style.zoom = "1";
    };

    document.addEventListener("gesturestart", eventListener);
    document.addEventListener("gesturechange", eventListener);
    document.addEventListener("gestureend", eventListener);
    return () => {
      document.removeEventListener("gesturestart", eventListener);
      document.removeEventListener("gesturechange", eventListener);
      document.removeEventListener("gestureend", eventListener);
    };
  }, []);

  // Helper function to get current audio position
  const getCurrentAudioPosition = (): number => {
    if (
      !audioContextRef.current ||
      !audioBufferRef.current ||
      !isPlayingRef.current
    ) {
      return pauseTimeRef.current;
    }

    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    return elapsed % audioBufferRef.current.duration;
  };

  // Audio control functions
  const playAudio = async (
    playbackRate: number = 1,
    preservePosition: boolean = false
  ) => {
    if (
      !audioContextRef.current ||
      !audioBufferRef.current ||
      !gainNodeRef.current
    )
      return;

    try {
      // Resume AudioContext if suspended (common on iOS)
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      // Get current position before stopping if we want to preserve it
      const currentPosition = preservePosition
        ? getCurrentAudioPosition()
        : pauseTimeRef.current;

      // Completely clean up any previous source instance
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (error) {
          // Ignore errors if source is already stopped
          console.warn("Failed to stop audio source:", error);
        }
        audioSourceRef.current.disconnect();
        audioSourceRef.current.onended = null; // Clear event handler
        audioSourceRef.current = null; // Nullify reference
      }

      // Reset state to ensure clean start
      isPlayingRef.current = false;

      // Create completely new source instance
      audioSourceRef.current = audioContextRef.current.createBufferSource();
      audioSourceRef.current.buffer = audioBufferRef.current;
      audioSourceRef.current.loop = true;
      audioSourceRef.current.playbackRate.value = playbackRate;
      audioSourceRef.current.connect(gainNodeRef.current);

      // Start from current position, pause time, or beginning
      const offset = currentPosition % audioBufferRef.current.duration;
      audioSourceRef.current.start(0, offset);
      startTimeRef.current = audioContextRef.current.currentTime - offset;
      isPlayingRef.current = true;
      shouldBePlayingRef.current = true;

      // Handle source ending (shouldn't happen with loop, but just in case)
      audioSourceRef.current.onended = () => {
        isPlayingRef.current = false;
        audioSourceRef.current = null; // Clean up reference when ended
      };
    } catch (error) {
      console.warn("Failed to play audio:", error);
      // Ensure clean state even on error
      isPlayingRef.current = false;
      if (audioSourceRef.current) {
        audioSourceRef.current = null;
      }
    }
  };

  const pauseAudio = () => {
    if (
      audioSourceRef.current &&
      isPlayingRef.current &&
      audioContextRef.current
    ) {
      // Calculate current position
      const elapsed =
        audioContextRef.current.currentTime - startTimeRef.current;
      pauseTimeRef.current = elapsed;

      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
      isPlayingRef.current = false;
    }
  };

  // Function to change playback rate without restarting from beginning
  const changePlaybackRate = async (newRate: number) => {
    if (audioOn && audioBufferRef.current && shouldBePlayingRef.current) {
      await playAudio(newRate, true); // preservePosition = true
    }
  };

  // Handle audio playback based on audioOn state
  const controlAudio = () => {
    if (audioOn && audioBufferRef.current) {
      shouldBePlayingRef.current = true;
      playAudio(isCriticalTime ? 2 : 1);
    } else {
      shouldBePlayingRef.current = false;
      pauseAudio();
    }
  }; // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    controlAudio();
  }, [audioOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle playback rate changes when critical time state changes
  useEffect(() => {
    if (audioOn && audioBufferRef.current && shouldBePlayingRef.current) {
      changePlaybackRate(isCriticalTime ? 2 : 1);
    }
  }, [isCriticalTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check AudioContext state periodically and attempt to resume if needed
  useEffect(() => {
    const checkAudioContext = async () => {
      // Don't interfere if document is hidden
      if (document.hidden) return;

      if (audioContextRef.current && shouldBePlayingRef.current) {
        if (audioContextRef.current.state === "suspended") {
          console.log(
            "Periodic check: AudioContext is suspended, waiting for user interaction"
          );
        } else if (
          audioContextRef.current.state === "running" &&
          !isPlayingRef.current
        ) {
          // AudioContext is running but audio isn't playing - restart it
          console.log("Periodic check: Restarting audio playback");
          playAudio(isCriticalTime ? 2 : 1);
        }
      }
    };

    const interval = setInterval(checkAudioContext, 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle iOS autoplay restrictions - resume audio on user interaction
  useEffect(() => {
    const handleUserInteraction = async () => {
      // Don't interfere if document is hidden
      if (document.hidden) return;

      if (
        audioContextRef.current &&
        audioContextRef.current.state === "suspended" &&
        shouldBePlayingRef.current
      ) {
        try {
          console.log("User interaction: Resuming suspended AudioContext");
          await audioContextRef.current.resume();
          if (shouldBePlayingRef.current && !isPlayingRef.current) {
            playAudio(isCriticalTime ? 2 : 1);
          }
        } catch (error) {
          console.warn("Failed to resume audio context:", error);
        }
      }
    };

    // Listen for various user interaction events
    const events = ["touchstart", "touchend", "mousedown", "keydown", "click"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        once: true,
        passive: true,
      });
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle background to foreground transition
  useEffect(() => {
    const handleVisibilityChange = async () => {
      console.log(
        "Visibility change handler - hidden:",
        document.hidden,
        "AudioContext state:",
        audioContextRef.current?.state,
        "shouldBePlaying:",
        shouldBePlayingRef.current,
        "isPlaying:",
        isPlayingRef.current
      );

      if (document.hidden) {
        // Page is now hidden - pause audio if playing
        if (isPlayingRef.current) {
          console.log("Visibility handler: Page hidden - pausing audio");
          pauseAudio();
        }
      } else if (
        !document.hidden &&
        shouldBePlayingRef.current &&
        audioContextRef.current
      ) {
        // Page is now visible and audio should be playing
        console.log(
          "Visibility handler: Page is now visible and audio should be playing"
        );
        try {
          if (audioContextRef.current.state === "suspended") {
            console.log(
              "Visibility handler: Attempting to resume suspended AudioContext"
            );
            await audioContextRef.current.resume();
          }

          // If AudioContext is running but audio isn't playing, restart it
          if (
            audioContextRef.current.state === "running" &&
            !isPlayingRef.current
          ) {
            console.log("Visibility handler: Restarting audio playback");
            playAudio(isCriticalTime ? 2 : 1);
          }
        } catch (error) {
          console.warn("Failed to resume audio on visibility change:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup - removed focus event listener to avoid conflicts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch user's highest score from API on component mount
  const fetchUserInfoScore = async () => {
    try {
      const response = await axios.get(
        "/3Care/GamifyCandyCrushUserInfo.do",
        {
          params: {
            campaignID: "gamehub",
            name: "candy-crush",
          },
        }
      );
      if (response.data && response.data.code === 200) {
        setBestScore(response.data.score || 0);
        setContinuousCheckinCount(response.data.continuousCheckinCount || 0);
        setSpecialItemPoint(response.data.specialItemPoint || 0);
        setTempSpecialItemPoint(response.data.specialItemPoint || 0);
        setCheckInToday(response.data.checkInToday);
        console.log("checkInToday:", response.data.checkInToday == "true");
      } else {
        console.warn("API returned non-success code:", response.data);
        window.location.reload(); // Reload page if API fails
      }
    } catch (error) {
      console.error("Error fetching highest score:", error);
      setBestScore(0);
    }
  };

  useEffect(() => {
    fetchUserInfoScore();
  }, []);

  // Directly play game
  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    if (params.get("page") === "game" && !isRedirectedToPlay.current) {
      isRedirectedToPlay.current = true;
      handlePlay();
    }
  });

  const handlePlay = () => {
    setPage("game");
  };

  const handlePlayFromTutorial = () => {
    setPage("game");
    setOpenInstructionsDialog(false);
  };

  const handleBackToMenu = () => {
    setPage("landing");
  };

  const handleCloseInstructions = () => {
    setOpenInstructionsDialog(false);
  };

  const router = useRouter();

  const handleLeaderBoard = () => {
    router.push("/leaderboard.jsp?req_d=my3");
  };

  const handleEventDetails = () => {
    router.push("/eventDetails.jsp?req_d=my3");
  };
  
  const handleCriticalTimeChange = (isCritical: boolean) => {
    setIsCriticalTime(isCritical);
  };

  return (
    <Box id="root">
      {page === "landing" && (
        <Landing
          audioOn={audioOn}
          continuousCheckinCount={continuousCheckinCount}
          specialItemPoint={specialItemPoint}
          setAudioOn={setAudioOn}
          onPlay={handlePlay}
          onInstructions={() => setOpenInstructionsDialog(true)}
          onLeaderBoard={handleLeaderBoard}
          onEventDetails={handleEventDetails}
        />
      )}
      {page === "game" && (
        <Game
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          timeLimit={timeLimit}
          timeBonusPerMatch={timeBonusPerMatch}
          gamePointBaseMinimumScore={gamePointBaseMinimumScore}
          gamePointBase={gamePointBase}
          gamePointHighest={gamePointHighest}
          items={items}
          bestScore={bestScore}
          continuousCheckinCount={continuousCheckinCount}
          specialItemPoint={specialItemPoint}
          tempSpecialItemPoint={tempSpecialItemPoint}
          checkInToday={checkInToday}
          pointsPerItem={pointsPerItem}
          bonusPointsPerExtraMatch={bonusPointsPerExtraMatch}
          comboMultipliers={comboMultipliers}
          comboPopupImages={comboPopupImages}
          audioOn={audioOn}
          setAudioOn={setAudioOn}
          setBestScore={setBestScore}
          onBackToMenu={handleBackToMenu}
          onCriticalTimeChange={handleCriticalTimeChange}
          fetchUserInfoScore={fetchUserInfoScore}
          setSpecialItemPoint={setSpecialItemPoint}
          setContinuousCheckinCount={setContinuousCheckinCount}
          setCheckInToday={setCheckInToday}
          setTempSpecialItemPoint={setTempSpecialItemPoint}
        />
      )}

      <GameInstructionsDialog
        open={openInstructionsDialog}
        onPlay={handlePlayFromTutorial}
        onClose={handleCloseInstructions}
      />
    </Box>
  );
}
