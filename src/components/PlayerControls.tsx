
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface PlayerControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const PlayerControls = ({
  audioRef,
  isPlaying,
  onPlayPauseClick,
  onPrevious,
  onNext,
  hasNext,
  hasPrevious,
}: PlayerControlsProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationRef = useRef<number | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const updateTimeDisplay = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateTimeDisplay);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      if (audio) {
        setDuration(audio.duration);
      }
    };
    
    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleEnded = () => {
      if (hasNext) {
        onNext();
      } else {
        if (audio) {
          audio.currentTime = 0;
          setCurrentTime(0);
        }
        onPlayPauseClick();
      }
    };
    
    if (audio) {
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      
      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [audioRef, hasNext, onNext, onPlayPauseClick]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
      animationRef.current = requestAnimationFrame(updateTimeDisplay);
    } else {
      audioRef.current?.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-1 px-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 30}
        step={0.01}
        onValueChange={handleProgressChange}
        className="mb-4"
      />
      
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevious}
          className={`p-2 rounded-full transition-all ${
            hasPrevious 
              ? "text-muted-foreground hover:text-foreground hover:bg-secondary" 
              : "text-muted-foreground/30 cursor-not-allowed"
          }`}
          disabled={!hasPrevious}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={onPlayPauseClick}
          className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors hover-scale"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        
        <button
          onClick={onNext}
          className={`p-2 rounded-full transition-all ${
            hasNext 
              ? "text-muted-foreground hover:text-foreground hover:bg-secondary" 
              : "text-muted-foreground/30 cursor-not-allowed"
          }`}
          disabled={!hasNext}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;
