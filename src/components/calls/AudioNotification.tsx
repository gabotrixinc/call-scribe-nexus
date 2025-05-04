
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

  // Create or update audio element when props change
  useEffect(() => {
    // Safely create audio element if it doesn't exist yet
    if (!audioRef.current) {
      try {
        const audio = new Audio();
        audio.src = audioSrc;
        audio.loop = loop;
        audio.volume = volume;
        audioRef.current = audio;
      } catch (error) {
        console.error('Error creating audio element:', error);
      }
    } else {
      // Update existing audio element
      try {
        audioRef.current.src = audioSrc;
        audioRef.current.loop = loop;
        audioRef.current.volume = volume;
      } catch (error) {
        console.error('Error updating audio element:', error);
      }
    }
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        } catch (error) {
          console.error('Error cleaning up audio element:', error);
        }
      }
    };
  }, [audioSrc, loop, volume]);

  // Handle play/pause based on play prop
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const handlePlay = async () => {
      try {
        if (play) {
          // Use promise to catch playback errors
          await audioElement.play();
          console.log('Audio notification started playing');
        } else {
          // Stop the audio
          audioElement.pause();
          if (!loop) {
            audioElement.currentTime = 0;
          }
        }
      } catch (error) {
        console.warn('Audio playback error:', error);
        // Most likely autoplay was prevented by browser
      }
    };
    
    handlePlay();
  }, [play, loop]);

  return null; // This component doesn't render anything visual
};

export default AudioNotification;
