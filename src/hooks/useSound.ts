import { useCallback, useEffect, useRef } from "react";

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

let sharedAudioContext: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
const audioBufferPending = new Map<string, Promise<AudioBuffer | null>>();
let unlockListenersBound = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return sharedAudioContext;
};

const bindUnlockListeners = (ctx: AudioContext) => {
  if (unlockListenersBound) return;
  unlockListenersBound = true;

  const unlock = async () => {
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Ignore and keep trying on next interaction.
      }
    }
    if (ctx.state === "running") {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    }
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
};

const loadBuffer = async (ctx: AudioContext, soundUrl: string) => {
  if (audioBufferCache.has(soundUrl)) {
    return audioBufferCache.get(soundUrl) ?? null;
  }
  if (audioBufferPending.has(soundUrl)) {
    return audioBufferPending.get(soundUrl) ?? null;
  }

  const pending = (async () => {
    try {
      const response = await fetch(soundUrl);
      if (!response.ok) {
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return null;
      }
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      if (!decoded || decoded.duration === 0) {
        return null;
      }
      audioBufferCache.set(soundUrl, decoded);
      return decoded;
    } catch {
      return null;
    } finally {
      audioBufferPending.delete(soundUrl);
    }
  })();

  audioBufferPending.set(soundUrl, pending);
  return pending;
};

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
        const ctx = getAudioContext();
        if (!ctx) return;
        audioContextRef.current = ctx;
        bindUnlockListeners(ctx);

        // Create gain node for volume control
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.gain.value = volume;
        gainNodeRef.current.connect(ctx.destination);
        audioBufferRef.current = await loadBuffer(ctx, soundUrl);
      } catch {
        // Keep silent if sound cannot initialize.
      }
    };

    initAudio();

    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
    };
  }, [soundUrl, volume]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const play = useCallback(async () => {
    if (
      !audioContextRef.current ||
      !gainNodeRef.current
    ) {
      return;
    }

    try {
      if (!audioBufferRef.current) {
        audioBufferRef.current = await loadBuffer(audioContextRef.current, soundUrl);
      }
      if (!audioBufferRef.current) {
        return;
      }

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
    } catch {
      // Keep silent if playback fails.
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
