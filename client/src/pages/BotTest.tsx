import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Music, Download, Search, Loader2 } from "lucide-react";

export default function BotTest() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Mocking the yt-search behavior for the test UI
      const mockResults = [
        { title: `${query} - Official Audio`, author: "Artist Name", timestamp: "3:45", url: "https://youtube.com/watch?v=example1" },
        { title: `${query} - Live Performance`, author: "Artist Name", timestamp: "4:20", url: "https://youtube.com/watch?v=example2" },
      ];
      setResults(mockResults);
    } catch (error) {
      toast({ title: "Search Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    toast({ title: "🎧 Downloading your music...", description: "Connecting to Render API..." });
    window.location.href = `/download?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-6 h-6" />
            GoatBot "Sing" Command Emulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter song name..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold border-b pb-2">❄️ Search Results</h3>
              {results.map((video, i) => (
                <Card key={i} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">🎶 {i + 1}. {video.title}</p>
                      <p className="text-sm text-muted-foreground">⏱ Duration: {video.timestamp} | 🎤 {video.author}</p>
                    </div>
                    <Button size="sm" onClick={() => handleDownload(video.url)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted">
        <CardContent className="p-4">
          <h4 className="font-bold mb-2 text-sm uppercase text-muted-foreground">GoatBot Integration Info</h4>
          <p className="text-sm">
            This UI demonstrates how your <code>sing.js</code> command interacts with the API. 
            The <code>handleDownload</code> function uses:
            <br />
            <code>GET /download?url=...</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
