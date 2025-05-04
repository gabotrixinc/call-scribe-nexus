
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAudio = () => {
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const audioInputRef = useRef<MediaStream | null>(null);
  const audioOutputRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Check if audio is supported on mount
  useEffect(() => {
    const isSupported = 
      typeof window !== 'undefined' && 
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia && 
      (window.AudioContext || (window as any).webkitAudioContext);
    
    setIsAudioSupported(isSupported);
    
    if (!isSupported) {
      setError('Tu navegador no soporta el acceso a audio. Por favor, intenta con un navegador más moderno.');
    }
    
    // Initialize audio output element for later use
    const audioEl = new Audio();
    audioOutputRef.current = audioEl;
    
    return () => {
      stopMicrophone();
    };
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
      
      // Create AudioContext if not already created
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
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
