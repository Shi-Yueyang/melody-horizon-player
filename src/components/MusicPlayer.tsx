
import { useState, useRef, useEffect } from "react";
import { useSpotifyPreview } from "@/hooks/useSpotifyPreview";
import { SpotifyTrack } from "@/types/spotify";
import TrackInfo from "./TrackInfo";
import PlayerControls from "./PlayerControls";
import TrackList from "./TrackList";
import SearchBar from "./SearchBar";
import VolumeControl from "./VolumeControl";
import { toast } from "sonner";

const MusicPlayer = () => {
  const {
    isLoading,
    tracks,
    currentTrack,
    searchTracks,
    playTrack,
    recentTracks,
  } = useSpotifyPreview();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Update current index when tracks or currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      const index = tracks.findIndex((track) => track.id === currentTrack.id);
      setCurrentIndex(index !== -1 ? index : null);
    }
  }, [tracks, currentTrack]);

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (!currentTrack) {
      toast("Please select a track first", {
        description: "Search for a song or choose from your recent tracks",
      });
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          toast.error("Error playing audio");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle track selection
  const handleTrackSelect = (track: SpotifyTrack) => {
    if (currentTrack && currentTrack.id === track.id) {
      // Toggle play/pause if selecting the same track
      handlePlayPause();
    } else {
      // Play a new track
      playTrack(track);
      setIsPlaying(true);
    }
  };

  // Handle previous track
  const handlePrevious = () => {
    if (currentIndex !== null && currentIndex > 0) {
      playTrack(tracks[currentIndex - 1]);
      setIsPlaying(true);
    } else if (recentTracks.length > 0 && tracks.length === 0) {
      // If no search results but we have recent tracks
      playTrack(recentTracks[0]);
      setIsPlaying(true);
    }
  };

  // Handle next track
  const handleNext = () => {
    if (currentIndex !== null && currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
      setIsPlaying(true);
    }
  };

  // Reset audio playback when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          toast.error("Error playing audio");
        });
      }
    }
  }, [currentTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="p-6 md:p-10 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column: Album art and track info */}
        <div className="lg:col-span-1 animate-fade-in">
          <div className="bg-card rounded-xl shadow-subtle p-4">
            <TrackInfo track={currentTrack} isPlaying={isPlaying} />
          </div>
        </div>

        {/* Right column: Search, controls, tracks */}
        <div className="lg:col-span-2 flex flex-col gap-8 animate-fade-in animate-delay-100">
          <SearchBar onSearch={searchTracks} isLoading={isLoading} />

          <div className="bg-card rounded-xl shadow-subtle p-6">
            <div className="flex flex-col gap-6">
              <PlayerControls
                audioRef={audioRef}
                isPlaying={isPlaying}
                onPlayPauseClick={handlePlayPause}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={
                  (currentIndex !== null && currentIndex > 0) ||
                  (tracks.length === 0 && recentTracks.length > 0)
                }
                hasNext={currentIndex !== null && currentIndex < tracks.length - 1}
              />
              
              <div className="flex justify-center">
                <VolumeControl audioRef={audioRef} />
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-fade-in animate-delay-200">
            {tracks.length > 0 && (
              <TrackList
                tracks={tracks}
                title="Search Results"
                onTrackSelect={handleTrackSelect}
                currentTrackId={currentTrack?.id}
              />
            )}

            {recentTracks.length > 0 && (
              <TrackList
                tracks={recentTracks}
                title="Recently Played"
                onTrackSelect={handleTrackSelect}
                currentTrackId={currentTrack?.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio 
        ref={audioRef}
        src={currentTrack?.preview_url || undefined}
        preload="auto"
      />
    </div>
  );
};

export default MusicPlayer;
