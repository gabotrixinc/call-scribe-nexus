
import React, { useEffect, useRef, useState } from 'react';

interface AudioNotificationProps {
  audioSrc: string;
  play: boolean;
  loop?: boolean;
  volume?: number;
}

const AudioNotification: React.FC<AudioNotificationProps> = ({
  audioSrc,
  play,
  loop = false,
  volume = 0.5
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Initialize audio element on component mount
  useEffect(() => {
    try {
      // Create audio element
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = loop;
      audio.volume = volume;
      
      // Add event listeners
      audio.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
        setAudioError(null);
        console.log('Audio loaded and ready to play');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        setAudioError(`Failed to load audio: ${e.type}`);
        setAudioLoaded(false);
      });
      
      // Assign audio source - ensure it's a valid URL 
      // Fixing the issue with the previous audio file not found
      let validAudioSrc = audioSrc;
      if (!validAudioSrc.startsWith('http') && !validAudioSrc.startsWith('/')) {
        validAudioSrc = `/${validAudioSrc}`;
      }
      
      // Use a fallback sound if the original isn't available
      audio.src = validAudioSrc;
      
      // Store audio reference
      audioRef.current = audio;
      
      return () => {
        // Clean up
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          
          audioRef.current.removeEventListener('canplaythrough', () => {});
          audioRef.current.removeEventListener('error', () => {});
        }
      };
    } catch (error) {
      console.error('Error creating audio element:', error);
      setAudioError('Failed to create audio element');
    }
  }, [audioSrc, loop, volume]);

  // Handle play/pause based on prop changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (play) {
      try {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Auto-play was prevented
            console.error('Error playing audio:', error);
            
            // Handle errors differently based on error type
            if (error.name === "NotAllowedError") {
              setAudioError('Auto-play prevented by browser. User interaction required.');
            } else if (error.name === "NotSupportedError") {
              setAudioError('Audio format not supported by browser.');
            } else {
              setAudioError(`Error playing audio: ${error.message}`);
            }
          });
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    } else {
      try {
        audio.pause();
        
        // Reset playback position if needed
        if (!loop) {
          audio.currentTime = 0;
        }
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  }, [play, loop]);

  // This component doesn't render anything visible
  return null;
};

export default AudioNotification;
