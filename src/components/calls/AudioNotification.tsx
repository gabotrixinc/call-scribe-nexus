
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
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  // Lista de fuentes de audio de fallback
  const fallbackSources = [
    '/sounds/incoming-call.mp3',
    '/audio/ringtone.mp3',
    'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' // Beep básico
  ];

  // Inicializar elemento de audio en el montaje del componente
  useEffect(() => {
    let cleanupFunction = () => {};
    
    try {
      // Crear elemento de audio
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = loop;
      audio.volume = volume;
      
      // Agregar event listeners
      const handleCanPlay = () => {
        console.log('Audio cargado y listo para reproducir:', audio.src);
        setAudioLoaded(true);
        setAudioError(null);
      };
      
      const handleError = (e: Event) => {
        const error = e as ErrorEvent;
        console.error('Error cargando audio:', error);
        setAudioError(`Error al cargar audio: ${error.type || 'desconocido'}`);
        setAudioLoaded(false);
        
        // Intentar con la siguiente fuente de fallback si aún no se ha activado
        if (!fallbackTriggered) {
          setFallbackTriggered(true);
          const currentIndex = fallbackSources.findIndex(src => src === audio.src);
          if (currentIndex >= 0 && currentIndex < fallbackSources.length - 1) {
            const nextSource = fallbackSources[currentIndex + 1];
            console.log(`Intentando con fuente de audio alternativa: ${nextSource}`);
            audio.src = nextSource;
          }
        }
      };
      
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
      
      // Asignar fuente de audio - asegurar que sea una URL válida
      let validAudioSrc = audioSrc;
      if (!validAudioSrc.startsWith('http') && !validAudioSrc.startsWith('/') && !validAudioSrc.startsWith('data:')) {
        validAudioSrc = `/${validAudioSrc}`;
      }
      
      // Usar la fuente original primero
      audio.src = validAudioSrc;
      
      // Almacenar referencia de audio
      audioRef.current = audio;
      
      cleanupFunction = () => {
        // Limpiar
        if (audio) {
          audio.pause();
          audio.src = '';
          
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
        }
      };
    } catch (error) {
      console.error('Error creando elemento de audio:', error);
      setAudioError('Error al crear elemento de audio');
    }
    
    return cleanupFunction;
  }, [audioSrc, loop, volume]);

  // Manejar reproducción/pausa basado en cambios de props
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (play) {
      try {
        console.log('Intentando reproducir audio:', audio.src);
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Auto-play fue prevenido
            console.error('Error reproduciendo audio:', error);
            
            // Manejar errores de manera diferente según el tipo
            if (error.name === "NotAllowedError") {
              setAudioError('Reproducción automática bloqueada por el navegador. Se requiere interacción del usuario.');
            } else if (error.name === "NotSupportedError") {
              setAudioError('Formato de audio no soportado por el navegador.');
              // Intentar con una fuente alternativa
              if (!fallbackTriggered) {
                setFallbackTriggered(true);
                audio.src = fallbackSources[0];
                audio.play().catch(err => console.error('Error con fuente alternativa:', err));
              }
            } else {
              setAudioError(`Error reproduciendo audio: ${error.message}`);
            }
          });
        }
      } catch (error) {
        console.error('Error reproduciendo audio:', error);
      }
    } else {
      try {
        audio.pause();
        
        // Resetear posición de reproducción si es necesario
        if (!loop) {
          audio.currentTime = 0;
        }
      } catch (error) {
        console.error('Error pausando audio:', error);
      }
    }
  }, [play, loop, fallbackTriggered]);

  // Este componente no renderiza nada visible
  return null;
};

export default AudioNotification;
