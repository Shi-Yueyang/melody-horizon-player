
import { SpotifyTrack } from "@/types/spotify";
import { Music } from "lucide-react";

interface TrackListProps {
  tracks: SpotifyTrack[];
  title: string;
  onTrackSelect: (track: SpotifyTrack) => void;
  currentTrackId?: string;
}

const TrackList = ({ tracks, title, onTrackSelect, currentTrackId }: TrackListProps) => {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="w-full animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <button
            key={`${track.id}-${index}`}
            onClick={() => onTrackSelect(track)}
            className={`w-full text-left p-3 rounded-lg transition-all hover-scale group ${
              currentTrackId === track.id
                ? "bg-primary/10 border border-primary/20"
                : "bg-secondary hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-background flex-shrink-0">
                {track.album.images[0]?.url ? (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <Music className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className={`font-medium text-sm truncate ${
                  currentTrackId === track.id ? "text-primary" : "text-foreground"
                }`}>
                  {track.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrackList;
