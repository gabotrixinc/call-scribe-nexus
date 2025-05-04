
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAudio = () => {
  const [isAudioSupported, setIsAudioSupported] = useState<boolean | null>(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Using refs to avoid AudioContext initialization during rendering
  const audioInputRef = useRef<MediaStream | null>(null);
  const audioOutputRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Check audio support on mount
  useEffect(() => {
    // Check audio support without initializing AudioContext
    const checkAudioSupport = () => {
      const isSupported = 
        typeof window !== 'undefined' && 
        window.navigator.mediaDevices && 
        window.navigator.mediaDevices.getUserMedia && 
        (window.AudioContext || (window as any).webkitAudioContext);
      
      setIsAudioSupported(!!isSupported);
      
      if (!isSupported) {
        setError('Tu navegador no soporta el acceso a audio. Por favor, intenta con un navegador más moderno.');
      }
    };
    
    checkAudioSupport();
    
    // Initialize audio output element for later use
    try {
      const audioEl = new Audio();
      audioOutputRef.current = audioEl;
    } catch (err) {
      console.error('Error creating Audio element:', err);
    }
    
    return () => {
      stopMicrophone();
      
      // Cleanup AudioContext if it was created
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (err) {
          console.error('Error closing AudioContext:', err);
        }
      }
    };
  }, []);
  
  // Safe initialization of AudioContext using useCallback to prevent recreation on each render
  const initializeAudioContext = useCallback((): AudioContext | null => {
    // Return existing context if already initialized
    if (audioContextRef.current) return audioContextRef.current;
    
    try {
      // Make sure we're in a browser environment
      if (typeof window === 'undefined') return null;
      
      // Get the correct constructor
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      
      // Create a new AudioContext instance with the new operator
      const context = new AudioContextClass();
      audioContextRef.current = context;
      return context;
    } catch (err) {
      console.error('Failed to initialize AudioContext:', err);
      setError('Error al inicializar el contexto de audio');
      return null;
    }
  }, []);
  
  // Enable microphone input
  const enableMicrophone = async () => {
    if (!isAudioSupported) {
      setError('Audio no soportado en este navegador');
      return false;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Request permission to access microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioInputRef.current = stream;
      
      // Safely initialize AudioContext
      const context = initializeAudioContext();
      if (!context) {
        throw new Error('No se pudo inicializar el contexto de audio');
      }
      
      setIsMicrophoneEnabled(true);
      
      toast({
        title: "Micrófono activado",
        description: "Se ha activado correctamente el micrófono"
      });
      
      return true;
    } catch (err: any) {
      console.error('Error enabling microphone:', err);
      
      let errorMsg = 'Error al activar el micrófono';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Permiso denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No se detectó ningún micrófono. Por favor, conecta un dispositivo de audio.';
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }
      
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Stop microphone input
  const stopMicrophone = () => {
    if (audioInputRef.current) {
      audioInputRef.current.getTracks().forEach(track => track.stop());
      audioInputRef.current = null;
    }
    
    setIsMicrophoneEnabled(false);
  };
  
  // Play audio from a given source
  const playAudio = async (src: string) => {
    if (!audioOutputRef.current) {
      setError('No se puede reproducir audio: dispositivo no inicializado');
      return false;
    }
    
    try {
      setIsProcessing(true);
      
      // Set up the audio element
      audioOutputRef.current.src = src;
      audioOutputRef.current.muted = false;
      
      // Play audio
      await audioOutputRef.current.play();
      setIsAudioEnabled(true);
      
      return true;
    } catch (err: any) {
      console.error('Error playing audio:', err);
      
      setError(`Error al reproducir audio: ${err.message || 'Error desconocido'}`);
      toast({
        title: "Error",
        description: `No se pudo reproducir el audio: ${err.message}`,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Stop audio playback
  const stopAudio = () => {
    if (audioOutputRef.current) {
      audioOutputRef.current.pause();
      audioOutputRef.current.currentTime = 0;
    }
    
    setIsAudioEnabled(false);
  };
  
  // Toggle audio mute state
  const toggleMute = () => {
    if (audioOutputRef.current) {
      audioOutputRef.current.muted = !audioOutputRef.current.muted;
    }
  };
  
  return {
    isAudioSupported,
    isMicrophoneEnabled,
    isAudioEnabled,
    isProcessing,
    error,
    enableMicrophone,
    stopMicrophone,
    playAudio,
    stopAudio,
    toggleMute,
  };
};
