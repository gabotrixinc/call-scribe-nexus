
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio element safely
  useEffect(() => {
    if (!audioRef.current) {
      try {
        // Create audio element only once
        const audio = new Audio();
        audio.preload = "auto"; // Preload the audio
        audio.loop = loop;
        audio.volume = volume;
        audioRef.current = audio;
        setIsInitialized(true);
      } catch (error) {
        console.error('Error creating audio element:', error);
      }
    }
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current = null;
        } catch (error) {
          console.error('Error cleaning up audio element:', error);
        }
      }
    };
  }, []);
  
  // Update audio properties when props change
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !isInitialized) return;
    
    try {
      audioElement.src = audioSrc;
      audioElement.loop = loop;
      audioElement.volume = volume;
    } catch (error) {
      console.error('Error updating audio element:', error);
    }
  }, [audioSrc, loop, volume, isInitialized]);

  // Handle play/pause based on play prop
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !isInitialized) return;
    
    const handlePlay = async () => {
      try {
        if (play) {
          // First ensure we have the latest src
          if (audioElement.src !== audioSrc && audioSrc) {
            audioElement.src = audioSrc;
          }
          
          // Use promise to catch playback errors
          const playPromise = audioElement.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn('Audio playback prevented:', error);
              // Most likely autoplay was prevented by browser policy
              // We'll leave it to the user to interact with the page first
            });
          }
        } else {
          // Stop the audio
          audioElement.pause();
          if (!loop) {
            audioElement.currentTime = 0;
          }
        }
      } catch (error) {
        console.warn('Audio control error:', error);
      }
    };
    
    handlePlay();
  }, [play, audioSrc, loop, isInitialized]);

  return null; // This component doesn't render anything visual
};

export default AudioNotification;
