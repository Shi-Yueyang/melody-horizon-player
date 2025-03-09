
import { useEffect } from "react";
import MusicPlayer from "@/components/MusicPlayer";
import { toast } from "sonner";

const Index = () => {
  useEffect(() => {
    // Show welcome message
    toast("Welcome to Melody Player", {
      description: "Search for songs to play 30-second previews from Spotify"
    });
    
    // Explain the need for Spotify credentials
    setTimeout(() => {
      toast.info("Important: Spotify API Credentials", {
        description: "You'll need to add your own Spotify API credentials in useSpotifyPreview.tsx",
        duration: 6000,
      });
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-6 px-6 md:px-10 animate-fade-in border-b">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight">Melody Player</h1>
          <p className="text-muted-foreground">Elegantly crafted music experience</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <MusicPlayer />
      </main>
      
      <footer className="w-full py-4 px-6 border-t text-sm text-muted-foreground text-center animate-fade-in">
        <p>Powered by Spotify Web API</p>
      </footer>
    </div>
  );
};

export default Index;
