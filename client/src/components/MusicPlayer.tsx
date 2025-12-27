import { motion, AnimatePresence } from "framer-motion";
import { TrackInfo } from "@shared/schema";
import { Disc3, Music2, User, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MusicPlayerProps {
  track: TrackInfo | null;
  isLoading: boolean;
  error: Error | null;
}

export function MusicPlayer({ track, isLoading, error }: MusicPlayerProps) {
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative z-10">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-4"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error.message}</p>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full aspect-video md:aspect-[21/9] rounded-3xl glass-card flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse" />
              <Disc3 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Extracting audio stream...</p>
          </motion.div>
        ) : track ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="overflow-hidden border-0 bg-black/40 backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl rounded-3xl">
              {/* Top Section: Art & Info */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                
                {/* Album Art */}
                <div className="relative group shrink-0">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
                  <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    {track.thumbnail ? (
                      <img 
                        src={track.thumbnail} 
                        alt={track.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Music2 className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 text-center md:text-left space-y-4 min-w-0 w-full">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white line-clamp-2" title={track.title}>
                      {track.title}
                    </h2>
                    <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-primary font-medium text-lg">
                      <User className="w-4 h-4" />
                      <span className="truncate">{track.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground bg-white/5 rounded-full px-4 py-2 w-fit mx-auto md:mx-0">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(track.duration)}</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="text-emerald-400 font-medium text-xs uppercase tracking-wider">High Quality</span>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="bg-white/5 p-4 md:p-6 backdrop-blur-md border-t border-white/5">
                <audio 
                  controls 
                  autoPlay 
                  src={track.audio} 
                  className="w-full outline-none focus:outline-none"
                  onError={(e) => console.error("Audio playback error", e)}
                />
                <div className="mt-4 text-center">
                  <a 
                    href={track.audio} 
                    download={`${track.title}.mp3`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    Direct Stream URL
                  </a>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
