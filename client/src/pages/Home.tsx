import { useState } from "react";
import { Search, Download, Play, Music, Clock, User, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrackInfo } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Mock results for UI layout demo
  const mockResults: TrackInfo[] = [
    {
      id: "1",
      title: "Sample Track 1",
      author: "Artist Name",
      duration: "3:45",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      url: "https://youtube.com/watch?v=1",
    },
    {
      id: "2",
      title: "Electronic Dreams",
      author: "Synth Master",
      duration: "4:20",
      thumbnail: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop",
      url: "https://youtube.com/watch?v=2",
    },
    {
      id: "3",
      title: "Lo-Fi Beats to Study",
      author: "Chill Cat",
      duration: "1:02:30",
      thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop",
      url: "https://youtube.com/watch?v=3",
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // In a real app, this would fetch from the backend
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Search started",
        description: `Looking for "${searchQuery}"...`,
      });
    }, 1000);
  };

  const startStreaming = (url: string) => {
    // Port 5001 is Python API, 5002 is Node API
    const apiUrl = `http://localhost:5001/play?url=${encodeURIComponent(url)}`;
    window.open(apiUrl, "_blank");
  };

  const startDownload = (url: string) => {
    const apiUrl = `http://localhost:5001/download?url=${encodeURIComponent(url)}`;
    window.open(apiUrl, "_blank");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <section className="relative h-64 rounded-xl overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1459749411177-042180ce673c?w=1200&h=400&fit=crop" 
          alt="Featured Music" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
          <Badge className="w-fit mb-2 bg-primary/80 hover:bg-primary no-default-hover-elevate">Featured Artist</Badge>
          <h1 className="text-4xl font-bold text-white mb-2">Toshiro Music</h1>
          <p className="text-white/80 max-w-md">The ultimate destination for your favorite YouTube tracks. Stream or download in high quality instantly.</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search YouTube tracks or paste URL..." 
              className="pl-10 h-12 bg-muted/50 border-border/50 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Button type="submit" size="lg" disabled={isSearching} data-testid="button-search">
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {["Lo-fi", "Electronic", "Rock", "Pop", "Classical", "Jazz"].map((tag) => (
            <Button key={tag} variant="outline" size="sm" className="rounded-full">
              {tag}
            </Button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Search Results</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mockResults.map((track) => (
            <Card 
              key={track.id} 
              className="group border-none bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden hover-elevate"
              data-testid={`card-track-${track.id}`}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="icon" 
                      className="rounded-full w-12 h-12 bg-primary text-primary-foreground hover:scale-110 transition-transform"
                      onClick={() => startStreaming(track.url)}
                      data-testid={`button-play-${track.id}`}
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary"
                      className="rounded-full w-10 h-10 bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
                      onClick={() => startDownload(track.url)}
                      data-testid={`button-download-${track.id}`}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded">
                    {track.duration}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold truncate text-sm" title={track.title}>{track.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="truncate">{track.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
