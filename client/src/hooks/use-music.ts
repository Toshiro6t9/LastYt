import { useQuery } from "@tanstack/react-query";
import { api, type TrackInfo } from "@shared/routes";
import { z } from "zod";

// Helper to validate search URL
const urlSchema = z.string().url();

export function useTrackInfo(url: string | null) {
  return useQuery({
    // Only fetch when we have a valid URL
    queryKey: [api.play.path, url],
    queryFn: async () => {
      if (!url) return null;
      
      // Validate URL client-side before sending
      const validUrl = urlSchema.safeParse(url);
      if (!validUrl.success) {
        throw new Error("Please enter a valid YouTube URL");
      }

      // Construct URL with query param manually since it's a GET request
      const fetchUrl = `${api.play.path}?url=${encodeURIComponent(url)}`;
      
      const res = await fetch(fetchUrl);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch track info");
      }

      const data = await res.json();
      return api.play.responses[200].parse(data);
    },
    enabled: !!url && url.length > 0,
    retry: false, // Don't retry on user error
  });
}
