
import React, { useRef, useEffect } from 'react';

interface AudioNotificationProps {
  audioSrc: string;
  play: boolean;
  loop?: boolean;
  volume?: number;
  onEnded?: () => void;
}

const AudioNotification: React.FC<AudioNotificationProps> = ({ 
  audioSrc,
  play,
  loop = false, 
  volume = 1,
  onEnded 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(Math.max(volume, 0), 1);
      audioRef.current.loop = loop;
    }
  }, [volume, loop]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (play) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => 
        console.error("Error playing audio notification:", err)
      );
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [play]);

  return (
    <audio 
      ref={audioRef}
      src={audioSrc}
      onEnded={onEnded}
      style={{ display: 'none' }}
    />
  );
};

export default AudioNotification;
