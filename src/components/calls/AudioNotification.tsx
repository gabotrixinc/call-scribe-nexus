
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
    if (!audioRef.current) {
      const audio = new Audio(audioSrc);
      audio.loop = loop;
      audio.volume = volume;
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [audioSrc, loop, volume]);
  
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (play) {
      const playPromise = audioRef.current.play();
      
      // Handle the play() promise to avoid the uncaught promise exception
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing audio:", error);
        });
      }
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [play]);

  return null; // This component doesn't render anything
};

export default AudioNotification;
