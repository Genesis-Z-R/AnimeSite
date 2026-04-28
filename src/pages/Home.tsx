import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, PlayCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import GlassBox from '../components/GlassBox';

export default function Home() {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [favorites, setFavorites] = useState<any[]>([]);

  // Load favorites from LocalStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem('ramsey-favorites');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  // Real-time Search Logic
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const delayFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery);
        const resultsArray = Array.isArray(res) ? res : (res.search || []);
        setSearchResults(resultsArray); 
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setIsSearching(false);
      }
    }, 500); 
    
    return () => clearTimeout(delayFn);
  }, [searchQuery]);

  // Remove Favorite directly from the Sidebar
  const removeFavorite = (identifier: string) => {
    const newFavorites = favorites.filter(f => (f.id || f.animeId) !== identifier);
    setFavorites(newFavorites);
    localStorage.setItem('ramsey-favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative selection:bg-sky-500/30">
      
      {/* Cinematic Background overlay */}
            {/* Cinematic Background overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url('/bgnd.png')" }} 
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/80 to-[#020617] backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="px-8 h-20 flex items-center justify-between border-b border-white/5 bg-slate-950/30 backdrop-blur-md">
          <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            RAMSEY<span className="text-white font-light uppercase">ANIME</span>
          </div>
        </nav>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Area: Hero & Real-Time Search */}
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center w-full">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              What are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">watching</span> today?
            </h1>
            <p className="text-slate-400 mb-10 text-lg">Stream your favorite anime in 1080p without interruptions.</p>

            <div className="relative w-full max-w-2xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
              <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                <Search className="w-6 h-6 text-slate-400 ml-4 mr-2" />
                <input 
                  type="text"
                  placeholder="Search for an anime (e.g. Jujutsu Kaisen)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-lg py-3 px-2 text-white placeholder:text-slate-500"
                />
                {isSearching && <Loader2 className="w-5 h-5 text-sky-400 animate-spin mr-4" />}
              </div>

              {/* Search Dropdown */}
              {searchQuery && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50 max-h-[400px] overflow-y-auto custom-scrollbar text-left">
                  {isSearching ? (
                    <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                      Searching the archives...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="px-4 py-3 border-b border-white/5 text-xs font-bold tracking-widest text-slate-500 uppercase">
                        Top Results
                      </div>
                      {searchResults.map(anime => {
                        // FIXED: Handle both id structures
                       const identifier = anime.id || anime.animeId || (anime.episodes && anime.episodes[0]?.id);
                        return (
                         <button 
  key={identifier}
  onClick={() => {
    navigate(`/watch/${identifier}`, { state: { anime } }); // <-- Added state here
    setSearchQuery('');
  }}
  className="w-full text-left p-4 hover:bg-sky-500/10 flex gap-4 items-center transition-colors border-b border-white/5 last:border-0 group/item"
>
                            <img src={anime.img || anime.image} alt={anime.title} className="w-12 h-16 object-cover rounded-lg shadow-md" />
                            <div className="flex flex-col gap-1 flex-1">
                              <span className="text-base font-bold text-slate-200 group-hover/item:text-sky-400 transition-colors">{anime.title}</span>
                              <span className="text-xs text-slate-500">{anime.released ? `Released: ${anime.released}` : 'Anime Series'}</span>
                            </div>
                            <PlayCircle className="w-6 h-6 text-sky-500 opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-4 group-hover/item:translate-x-0 duration-300" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No anime found matching "<span className="text-white">{searchQuery}</span>"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Area: Favorites Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <GlassBox className="p-6 h-[600px] flex flex-col">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> My Favorites
              </h3>
              
              <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {favorites.length > 0 ? (
                  favorites.map((anime) => {
                    const identifier = anime.id || anime.animeId;
                    return (
                      <div 
                        key={identifier} 
                        className="relative group flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
                        onClick={() => navigate(`/watch/${identifier}`)}
                      >
                        {/* Fallback image if scraping metadata didn't have one */}
                        {anime.img || anime.image ? (
                          <img src={anime.img || anime.image} className="w-12 h-16 object-cover rounded-lg" alt={anime.title} />
                        ) : (
                          <div className="w-12 h-16 bg-slate-800 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-slate-600" />
                          </div>
                        )}
                        <div className="flex flex-col justify-center flex-1">
                          <span className="text-sm font-bold line-clamp-2 text-slate-200 group-hover:text-sky-400 transition-colors">{anime.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(identifier);
                          }}
                          className="absolute -top-2 -right-2 p-1.5 bg-slate-900 border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 hover:border-rose-500/50"
                        >
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <Heart className="w-10 h-10 mb-3" />
                    <span className="text-sm">No favorites yet.</span>
                    <span className="text-xs mt-1">Watch an episode to save it!</span>
                  </div>
                )}
              </div>
            </GlassBox>
          </div>

        </main>
      </div>
    </div>
  );
}