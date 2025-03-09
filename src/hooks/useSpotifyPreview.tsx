
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SpotifySearchResponse, SpotifyTrack } from "@/types/spotify";

// Create a 30-minute token cache 
const TOKEN_CACHE_KEY = "spotify_token";
const TOKEN_EXPIRY_KEY = "spotify_token_expiry";

interface UseSpotifyPreviewReturn {
  isLoading: boolean;
  tracks: SpotifyTrack[];
  currentTrack: SpotifyTrack | null;
  searchTracks: (query: string) => Promise<void>;
  playTrack: (track: SpotifyTrack) => void;
  recentTracks: SpotifyTrack[];
}

export function useSpotifyPreview(): UseSpotifyPreviewReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Initialize recentTracks from localStorage
  useEffect(() => {
    try {
      const savedTracks = localStorage.getItem("recentTracks");
      if (savedTracks) {
        setRecentTracks(JSON.parse(savedTracks));
      }
    } catch (error) {
      console.error("Error loading recent tracks:", error);
    }
  }, []);

  // Update localStorage when recentTracks changes
  useEffect(() => {
    if (recentTracks.length > 0) {
      localStorage.setItem("recentTracks", JSON.stringify(recentTracks));
    }
  }, [recentTracks]);

  // Fetch or retrieve cached Spotify token
  const getAccessToken = useCallback(async () => {
    setTokenLoading(true);
    
    // Check if we have a non-expired token
    const cachedToken = localStorage.getItem(TOKEN_CACHE_KEY);
    const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (cachedToken && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry, 10)) {
      setAccessToken(cachedToken);
      setTokenLoading(false);
      return cachedToken;
    }

    // No valid token, get a new one
    try {
      const clientId = '61ce55f9bb6a40988f129c0b42658777'; // Your Spotify Client ID
      const clientSecret = '005a745e0bfa4fa1bd445acae1f5f6a8'; // Your Spotify Client Secret

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      
      if (data.access_token) {
        // Cache token for 50 minutes (Spotify tokens last 60 minutes)
        const expiry = new Date().getTime() + 50 * 60 * 1000;
        localStorage.setItem(TOKEN_CACHE_KEY, data.access_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
        
        setAccessToken(data.access_token);
        setTokenLoading(false);
        return data.access_token;
      } else {
        throw new Error("Failed to get access token");
      }
    } catch (error) {
      console.error("Error fetching Spotify token:", error);
      toast.error("Failed to connect to Spotify");
      setTokenLoading(false);
      return null;
    }
  }, []);

  const searchTracks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTracks([]);
      return;
    }

    setIsLoading(true);
    try {
      // Make sure we have a token before searching
      const token = accessToken || await getAccessToken();
      
      if (!token) {
        throw new Error("Authentication failed");
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // If token expired during this session, try to get a new one
        if (response.status === 401) {
          localStorage.removeItem(TOKEN_CACHE_KEY);
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
          const newToken = await getAccessToken();
          
          if (newToken) {
            // Retry the search with the new token
            const retryResponse = await fetch(
              `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
            
            if (!retryResponse.ok) {
              throw new Error(`Error: ${retryResponse.status}`);
            }
            
            const data: SpotifySearchResponse = await retryResponse.json();
            const tracksWithPreviews = data.tracks.items.filter(
              (track) => track.preview_url
            );
            
            setTracks(tracksWithPreviews);
            return;
          }
        }
        
        throw new Error(`Error: ${response.status}`);
      }

      const data: SpotifySearchResponse = await response.json();
      const tracksWithPreviews = data.tracks.items.filter(
        (track) => track.preview_url
      );

      setTracks(tracksWithPreviews);
    } catch (error) {
      console.error("Error searching tracks:", error);
      toast.error("Failed to search for tracks");
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, getAccessToken]);

  const playTrack = useCallback((track: SpotifyTrack) => {
    setCurrentTrack(track);
    
    // Add to recent tracks (if not already the most recent)
    setRecentTracks(prev => {
      // Remove the track if it already exists
      const filteredTracks = prev.filter(t => t.id !== track.id);
      // Add to the beginning, limit to 5 recent tracks
      return [track, ...filteredTracks].slice(0, 5);
    });
  }, []);

  // Initialize token on mount
  useEffect(() => {
    getAccessToken();
  }, [getAccessToken]);

  return {
    isLoading,
    tracks,
    currentTrack,
    searchTracks,
    playTrack,
    recentTracks,
  };
}
