import React, { useEffect, useRef } from 'react';
import { VideoPlayer } from '../video/VideoPlayer';
import { useWatchParty } from '../../hooks/useWatchParty';

interface WatchPartyPlayerProps {
  partyId: string;
  src: string;
  poster?: string;
  title?: string;
}

export const WatchPartyPlayer: React.FC<WatchPartyPlayerProps> = ({
  partyId,
  src,
  poster,
  title
}) => {
  const { watchParty, isHost, syncPlayback } = useWatchParty(partyId);
  const lastSyncRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Sync playback state when party updates (for non-hosts)
    if (watchParty && !isHost) {
      const video = document.querySelector('video');
      if (video) {
        const timeDiff = Math.abs(video.currentTime - watchParty.current_time);
        
        // Only sync if there's a significant difference (more than 2 seconds)
        if (timeDiff > 2) {
          video.currentTime = watchParty.current_time;
        }
        
        if (watchParty.is_playing && video.paused) {
          video.play();
        } else if (!watchParty.is_playing && !video.paused) {
          video.pause();
        }
      }
    }
  }, [watchParty?.current_time, watchParty?.is_playing, isHost]);

  const handleTimeUpdate = (currentTime: number) => {
    if (isHost && watchParty) {
      // Throttle sync updates to avoid spam
      const now = Date.now();
      if (now - lastSyncRef.current > 5000) { // Sync every 5 seconds
        lastSyncRef.current = now;
        
        // Clear existing timeout
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        
        // Debounce the sync call
        syncTimeoutRef.current = setTimeout(() => {
          const video = document.querySelector('video');
          if (video) {
            syncPlayback(video.currentTime, !video.paused);
          }
        }, 1000);
      }
    }
  };

  const handlePlayStateChange = () => {
    if (isHost) {
      const video = document.querySelector('video');
      if (video) {
        syncPlayback(video.currentTime, !video.paused);
      }
    }
  };

  return (
    <div className="relative">
      {/* Host indicator */}
      {isHost && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          🎬 Host Controls
        </div>
      )}
      
      {/* Sync indicator for participants */}
      {!isHost && watchParty && (
        <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          🔄 Synced with host
        </div>
      )}

      <VideoPlayer
        src={src}
        poster={poster}
        title={title}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleTimeUpdate}
      />
      
      {/* Add event listeners for play/pause */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const video = document.querySelector('video');
              if (video) {
                video.addEventListener('play', ${handlePlayStateChange});
                video.addEventListener('pause', ${handlePlayStateChange});
              }
            });
          `
        }}
      />
    </div>
  );
};