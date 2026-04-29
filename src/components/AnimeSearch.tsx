import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, PlayCircle } from 'lucide-react';

interface MalResult {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  year: number;
}

const AnimeSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const json = await response.json();
        setResults(json.data || []);
      } catch (error) {
        console.error("Search fetch error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectAnime = (malId: number) => {
    // This now correctly routes to the new info page
    navigate(`/info/${malId}`);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
      <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
        <Search className="w-6 h-6 text-slate-400 ml-4 mr-2" />
        <input 
          type="text"
          placeholder="Search for an anime (e.g. Jujutsu Kaisen)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-lg py-3 px-2 text-white placeholder:text-slate-500"
        />
        {isSearching && <Loader2 className="w-5 h-5 text-sky-400 animate-spin mr-4" />}
      </div>

      {query && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50 max-h-[400px] overflow-y-auto custom-scrollbar text-left">
          {isSearching ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              Searching MyAnimeList...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              <div className="px-4 py-3 border-b border-white/5 text-xs font-bold tracking-widest text-slate-500 uppercase">
                Top Results
              </div>
              {results.map((anime) => (
                <button 
                  key={anime.mal_id}
                  onClick={() => handleSelectAnime(anime.mal_id)}
                  className="w-full text-left p-4 hover:bg-sky-500/10 flex gap-4 items-center transition-colors border-b border-white/5 last:border-0 group/item"
                >
                  <img src={anime.images.jpg.image_url} alt={anime.title} className="w-12 h-16 object-cover rounded-lg shadow-md" />
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-base font-bold text-slate-200 group-hover/item:text-sky-400 transition-colors">{anime.title}</span>
                    <span className="text-xs text-slate-500">{anime.year ? `Released: ${anime.year}` : 'Anime Series'}</span>
                  </div>
                  <PlayCircle className="w-6 h-6 text-sky-500 opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-4 group-hover/item:translate-x-0 duration-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No anime found matching "<span className="text-white">{query}</span>"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimeSearch;