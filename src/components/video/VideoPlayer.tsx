import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture, SkipBack, SkipForward } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface QualityOption {
  quality: string;
  url: string;
  bitrate?: number;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  qualityOptions?: QualityOption[];
  playbackSpeeds?: string[];
  onTimeUpdate?: (currentTime: number) => void;
  onProgress?: (progress: number) => void;
  initialProgress?: number;
  contentType?: 'video' | 'highlight' | 'match';
  contentId?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster, 
  title,
  qualityOptions = [],
  playbackSpeeds = ['0.5', '0.75', '1', '1.25', '1.5', '2'],
  onTimeUpdate,
  onProgress,
  initialProgress = 0,
  contentType,
  contentId
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(qualityOptions[0]?.quality || 'auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressUpdateRef = useRef<NodeJS.Timeout>();
  
  const { user } = useAuth();

  useEffect(() => {
    if (videoRef.current && initialProgress > 0) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [initialProgress]);

  useEffect(() => {
    // Track watch progress every 10 seconds
    if (user && contentType && contentId) {
      progressUpdateRef.current = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          const progress = Math.floor(videoRef.current.currentTime);
          onProgress?.(progress);
          
          // Track in database (you would implement this function)
          // trackWatchProgress(contentType, contentId, progress);
        }
      }, 10000);

      return () => {
        if (progressUpdateRef.current) {
          clearInterval(progressUpdateRef.current);
        }
      };
    }
  }, [user, contentType, contentId, onProgress]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const changeQuality = (quality: string) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      const qualityOption = qualityOptions.find(q => q.quality === quality);
      if (qualityOption) {
        videoRef.current.src = qualityOption.url;
        videoRef.current.currentTime = currentTime;
        
        if (wasPlaying) {
          videoRef.current.play();
        }
      }
      
      setCurrentQuality(quality);
      setShowSettings(false);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onClick={togglePlay}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-gray-300">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button onClick={() => skip(-10)} className="text-white hover:text-gray-300">
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button onClick={() => skip(10)} className="text-white hover:text-gray-300">
                <SkipForward className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white hover:text-gray-300">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Settings Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-gray-300"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg p-4 min-w-48">
                    {/* Quality Options */}
                    {qualityOptions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-white text-sm font-medium mb-2">Quality</h4>
                        <div className="space-y-1">
                          {qualityOptions.map((option) => (
                            <button
                              key={option.quality}
                              onClick={() => changeQuality(option.quality)}
                              className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                                currentQuality === option.quality
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              {option.quality}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Playback Speed */}
                    <div>
                      <h4 className="text-white text-sm font-medium mb-2">Speed</h4>
                      <div className="space-y-1">
                        {playbackSpeeds.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changePlaybackSpeed(parseFloat(speed))}
                            className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                              playbackSpeed === parseFloat(speed)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={togglePictureInPicture}
                className="text-white hover:text-gray-300"
                title="Picture in Picture"
              >
                <PictureInPicture className="w-5 h-5" />
              </button>
              
              <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      {title && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
          {title}
        </div>
      )}
    </div>
  );
};