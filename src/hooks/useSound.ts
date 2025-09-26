import { useCallback, useEffect, useRef } from "react";

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

const useSound = (soundUrl: string, options: SoundOptions = {}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const { volume = 1, loop = false } = options;

  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create AudioContext
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Create gain node for volume control
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = volume;
        gainNodeRef.current.connect(audioContextRef.current.destination);

        // Load and decode audio file
        const response = await fetch(soundUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Check if the file has content
        if (arrayBuffer.byteLength === 0) {
          return;
        }

        audioBufferRef.current = await audioContextRef.current.decodeAudioData(
          arrayBuffer
        );

        // Validate decoded audio has content
        if (audioBufferRef.current && audioBufferRef.current.duration === 0) {
          audioBufferRef.current = null;
        }
      } catch (error) {
        console.warn("Failed to initialize sound:", error);
      }
    };

    initAudio();

    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [soundUrl, volume]);

  const play = useCallback(async () => {
    if (
      !audioContextRef.current ||
      !audioBufferRef.current ||
      !gainNodeRef.current
    ) {
      console.warn(
        `Cannot play sound: Audio not loaded properly for ${soundUrl}`
      );
      return;
    }

    try {
      // Resume AudioContext if suspended
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      // Stop current source if playing
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }

      // Create new source
      audioSourceRef.current = audioContextRef.current.createBufferSource();
      audioSourceRef.current.buffer = audioBufferRef.current;
      audioSourceRef.current.loop = loop;
      audioSourceRef.current.connect(gainNodeRef.current);

      // For sound effects, always start from beginning (reset currentTime to 0)
      audioSourceRef.current.start(0);
      startTimeRef.current = audioContextRef.current.currentTime;
      pauseTimeRef.current = 0; // Reset pause time for fresh playback
      isPlayingRef.current = true;

      // Handle source ending
      audioSourceRef.current.onended = () => {
        isPlayingRef.current = false;
        audioSourceRef.current = null;
      };
    } catch (error) {
      console.warn("Sound playback error:", error);
    }
  }, [loop, soundUrl]);

  const stop = useCallback(() => {
    if (audioSourceRef.current && isPlayingRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
      isPlayingRef.current = false;
      pauseTimeRef.current = 0; // Reset to beginning
    }
  }, []);

  const pause = useCallback(() => {
    if (
      audioSourceRef.current &&
      isPlayingRef.current &&
      audioContextRef.current
    ) {
      // Calculate current position for potential resume
      const elapsed =
        audioContextRef.current.currentTime - startTimeRef.current;
      pauseTimeRef.current = elapsed;

      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
      isPlayingRef.current = false;
    }
  }, []);

  return { play, stop, pause };
};

export default useSound;
