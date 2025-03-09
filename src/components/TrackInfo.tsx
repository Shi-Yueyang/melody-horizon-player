
import { SpotifyTrack } from "@/types/spotify";
import { useState, useEffect } from "react";

interface TrackInfoProps {
  track: SpotifyTrack | null;
  isPlaying: boolean;
}

const TrackInfo = ({ track, isPlaying }: TrackInfoProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset image loaded state when track changes
    setImageLoaded(false);
  }, [track]);

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 animate-fade-in">
        <div className="w-56 h-56 rounded-md bg-secondary/50 flex items-center justify-center animate-pulse-soft">
          <span className="text-muted-foreground text-sm">No track selected</span>
        </div>
        <div className="mt-6 w-40 h-6 bg-secondary/50 rounded-md"></div>
        <div className="mt-2 w-28 h-4 bg-secondary/50 rounded-md"></div>
      </div>
    );
  }

  const albumImage = track.album.images[0]?.url || "";
  
  return (
    <div className="flex flex-col items-center p-6 animate-fade-in">
      <div className="relative w-64 h-64 rounded-md overflow-hidden shadow-medium">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-secondary/50 animate-pulse-soft flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        )}
        <img
          src={albumImage}
          alt={`${track.album.name} cover`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isPlaying ? "animate-pulse-soft" : ""
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      
      <div className="mt-6 text-center">
        <h2 className="font-semibold text-lg tracking-tight truncate max-w-xs">
          {track.name}
        </h2>
        <p className="text-muted-foreground text-sm mt-1 truncate max-w-xs">
          {track.artists.map(artist => artist.name).join(", ")}
        </p>
      </div>
    </div>
  );
};

export default TrackInfo;
