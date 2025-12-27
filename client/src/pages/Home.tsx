import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Music, Youtube, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrackInfo } from "@/hooks/use-music";
import { MusicPlayer } from "@/components/MusicPlayer";

export default function Home() {
  const [urlInput, setUrlInput] = useState("");
  const [searchUrl, setSearchUrl] = useState<string | null>(null);

  const { data: track, isLoading, error } = useTrackInfo(searchUrl);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setSearchUrl(urlInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[100px]" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-12 md:py-24 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary-foreground/80 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>High Quality Audio Extraction</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            <span className="block text-foreground">Stream Music</span>
            <span className="text-gradient-primary">Without Limits</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Paste a YouTube URL to instantly extract and play high-quality audio. 
            No ads, no interruptions, just music.
          </motion.p>
        </div>

        {/* Search Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl mx-auto"
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative flex items-center bg-card border border-white/10 rounded-2xl p-2 shadow-2xl input-glow transition-all duration-300">
              <div className="pl-4 pr-2 text-muted-foreground">
                <Youtube className="w-6 h-6" />
              </div>
              
              <Input
                type="url"
                placeholder="Paste YouTube URL here..."
                className="flex-1 border-0 bg-transparent h-14 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              
              <Button 
                type="submit" 
                size="lg"
                disabled={!urlInput || isLoading}
                className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 ml-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    Play <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Quick Tips */}
          {!track && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground/60"
            >
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                <Music className="w-4 h-4" />
                <span>Best Quality Audio</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span>Smart Extraction</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Player Component */}
        <MusicPlayer 
          track={track || null} 
          isLoading={isLoading} 
          error={error as Error | null} 
        />

      </main>
      
      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center text-xs text-muted-foreground/30 pointer-events-none">
        <p>Built for educational purposes. Please respect copyright laws.</p>
      </footer>
    </div>
  );
}
