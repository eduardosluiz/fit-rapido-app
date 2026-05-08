import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onClose?: () => void;
}

export default function VideoPlayer({ videoUrl, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Tenta forçar fullscreen se o status mudar para carregado e ainda não estiver
    if (status.isLoaded && !isFullscreen && Platform.OS !== 'web') {
      videoRef.current?.presentFullscreenPlayer();
      setIsFullscreen(true);
    }
  }, [status.isLoaded]);

  useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setStatus(playbackStatus);
      setIsLoading(false);
      setError(null);
      
      // Tenta abrir em tela cheia automaticamente assim que carregar
      if (videoRef.current && !isFullscreen && Platform.OS !== 'web') {
        videoRef.current.presentFullscreenPlayer();
        setIsFullscreen(true);
      }
    } else if (playbackStatus.error) {
      setError('Erro ao carregar vídeo');
      setIsLoading(false);
    }
  };

  const onFullscreenUpdate = ({ fullscreenUpdate }: { fullscreenUpdate: number }) => {
    // Se o usuário fechar a tela cheia (status 3 no expo-av), fecha o modal também
    if (fullscreenUpdate === 3 && onClose) {
      onClose();
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const toggleFullscreen = async () => {
    if (videoRef.current) {
      try {
        if (isFullscreen) {
          await videoRef.current.dismissFullscreenPlayer();
          setIsFullscreen(false);
          if (Platform.OS === 'android') {
            StatusBar.setHidden(false);
          }
        } else {
          await videoRef.current.presentFullscreenPlayer();
          setIsFullscreen(true);
          if (Platform.OS === 'android') {
            StatusBar.setHidden(true);
          }
        }
      } catch (error) {
        console.error('Erro ao alternar tela cheia:', error);
        // Se houver erro, apenas atualiza o estado local
        setIsFullscreen(!isFullscreen);
      }
    }
  };

  const changePlaybackRate = async () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(nextRate, true);
    }
  };

  const seekBackward = async () => {
    if (videoRef.current && status.isLoaded) {
      const newPosition = Math.max(0, (status.positionMillis || 0) - 10000);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const seekForward = async () => {
    if (videoRef.current && status.isLoaded) {
      const newPosition = Math.min(
        status.durationMillis || 0,
        (status.positionMillis || 0) + 10000,
      );
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = status.isLoaded && status.durationMillis
    ? (status.positionMillis || 0) / status.durationMillis
    : 0;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Verifique sua conexão e tente novamente</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header elegante e minimalista */}
      <View style={styles.header}>
        <View style={{ width: 44 }} /> 
        
        {title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
        
        <TouchableOpacity 
          onPress={onClose} 
          style={styles.closeButtonHeader}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Container do vídeo */}
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUrl }}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={true}
            useNativeControls={true} // Sempre ativo para permitir controle manual
            playsInline={Platform.OS !== 'web'} // No web, playsInline pode atrapalhar o fullscreen nativo do browser
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onFullscreenUpdate={onFullscreenUpdate}
          />
        </View>

        {/* No mobile, o vídeo abrirá em tela cheia nativa. No web, usamos os controles nativos. */}
        {Platform.OS !== 'web' && isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#c8921a" />
            <Text style={styles.loadingText}>Iniciando vídeo...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: '#000000',
    zIndex: 100,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  closeButtonHeader: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    maxWidth: 450,
    maxHeight: '85%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        objectFit: 'contain',
        // Garante que o elemento de vídeo no DOM tenha as propriedades certas
        flex: 1,
      }
    })
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 20,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  centralPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  centralPlayButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200, 146, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 15,
    paddingHorizontal: 16,
    maxWidth: 450, // Sincroniza com a largura do vídeo vertical
    alignSelf: 'center',
    width: '100%',
    zIndex: 25,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 12,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#c8921a',
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#c8921a',
    position: 'absolute',
    top: -4,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  timeSeparator: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
  },
  controlButtonPrimary: {
    backgroundColor: 'rgba(200, 146, 26, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  controlButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  controlLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#000',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});

