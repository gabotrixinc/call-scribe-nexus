
import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    // Create audio element if it doesn't exist yet
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = audioSrc;
      audio.loop = loop;
      audio.volume = volume;
      audioRef.current = audio;
    } else {
      // Update existing audio element
      audioRef.current.src = audioSrc;
      audioRef.current.loop = loop;
      audioRef.current.volume = volume;
    }
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioSrc, loop, volume]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    if (play) {
      // Use promise to catch playback errors
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio notification started playing');
          })
          .catch(error => {
            console.warn('Audio autoplay prevented:', error);
            // Browser might have blocked autoplay
          });
      }
    } else {
      // Stop the audio
      audioElement.pause();
      if (!loop) {
        audioElement.currentTime = 0;
      }
    }
  }, [play, loop]);

  return null; // This component doesn't render anything visual
};

export default AudioNotification;
