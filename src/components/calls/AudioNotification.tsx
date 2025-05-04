
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
    // Crear elemento de audio
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.loop = loop;
    audio.volume = volume;
    
    // Limpiar al desmontar
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
      // Usar promesa para capturar errores de reproducción
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio notification started playing');
          })
          .catch(error => {
            console.warn('Audio autoplay prevented:', error);
            // Posiblemente el navegador bloqueó la reproducción automática
            // Informar al usuario que debe interactuar con la página primero
          });
      }
    } else {
      // Detener el audio
      audioElement.pause();
      if (!loop) {
        audioElement.currentTime = 0;
      }
    }
  }, [play, loop]);

  return null; // Este componente no renderiza nada visual
};

export default AudioNotification;
