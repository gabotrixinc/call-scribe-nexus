
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioOptions {
  src?: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}

interface UseAudioReturn {
  playing: boolean;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  setVolume: (volume: number) => void;
  hasStopped: boolean;
  duration: number | null;
  currentTime: number;
  element: HTMLAudioElement | null;
  loaded: boolean;
  error: string | null;
}

export function useAudio({
  src,
  autoPlay = false,
  loop = false,
  volume = 1.0
}: UseAudioOptions = {}): UseAudioReturn {
  // Use refs to avoid recreating the audio element on every render
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasStopped, setHasStopped] = useState(true);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazily initialize the audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      try {
        // Create the AudioContext with new operator
        audioRef.current = new Audio();
        
        // Configure initial options
        if (src) audioRef.current.src = src;
        audioRef.current.loop = loop;
        audioRef.current.volume = volume;
        audioRef.current.autoplay = autoPlay;
        
        // Add event listeners
        audioRef.current.addEventListener('loadeddata', () => {
          setLoaded(true);
          setDuration(audioRef.current?.duration || null);
        });
        
        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current?.currentTime || 0);
        });
        
        audioRef.current.addEventListener('ended', () => {
          if (!loop) {
            setPlaying(false);
            setHasStopped(true);
          }
        });
        
        audioRef.current.addEventListener('error', (e) => {
          setError(`Error loading audio: ${e}`);
          setPlaying(false);
        });
        
        if (autoPlay) {
          audioRef.current.play()
            .then(() => {
              setPlaying(true);
              setHasStopped(false);
            })
            .catch(err => {
              console.warn('Autoplay prevented:', err);
              setPlaying(false);
            });
        }
      } catch (err) {
        console.error('Error initializing audio element:', err);
        setError('Error initializing audio');
      }
    }
    
    return audioRef.current;
  }, [src, loop, volume, autoPlay]);

  // Update audio element when props change
  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;
    
    // Update properties if they've changed
    if (audio.src !== src && src) audio.src = src;
    if (audio.loop !== loop) audio.loop = loop;
    if (audio.volume !== volume) audio.volume = volume;
    
    // Clean up on unmount
    return () => {
      if (audio) {
        audio.pause();
        
        // Remove event listeners
        audio.removeEventListener('loadeddata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('error', () => {});
        
        // Help browser GC the audio element
        audioRef.current = null;
      }
    };
  }, [src, loop, volume, getAudio]);

  const play = useCallback(async () => {
    const audio = getAudio();
    if (!audio) return;
    
    try {
      await audio.play();
      setPlaying(true);
      setHasStopped(false);
    } catch (err) {
      console.warn('Error playing audio:', err);
      setError(`Error playing audio: ${err}`);
    }
  }, [getAudio]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (playing) {
      pause();
    } else {
      await play();
    }
  }, [playing, play, pause]);

  const setAudioVolume = useCallback((newVolume: number) => {
    const audio = getAudio();
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, [getAudio]);

  return {
    playing,
    play,
    pause,
    toggle,
    setVolume: setAudioVolume,
    hasStopped,
    duration,
    currentTime,
    element: audioRef.current,
    loaded,
    error
  };
}

export default useAudio;
