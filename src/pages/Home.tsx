import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, PlayCircle } from 'lucide-react';
import GlassBox from '../components/GlassBox';
import AnimeSearch from '../components/AnimeSearch';

export default function Home() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);

  // Load favorites from LocalStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem('ramsey-favorites');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  // Remove Favorite directly from the Sidebar
  const removeFavorite = (identifier: string) => {
    const newFavorites = favorites.filter(f => (f.id || f.animeId) !== identifier);
    setFavorites(newFavorites);
    localStorage.setItem('ramsey-favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative selection:bg-sky-500/30">
      
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
          
          {/* Left Area: Hero & New MAL Search */}
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center w-full">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              What are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">watching</span> today?
            </h1>
            <p className="text-slate-400 mb-10 text-lg">Stream your favorite anime in 1080p without interruptions.</p>

            <div className="w-full max-w-2xl group">
              {/* The new component handles everything now */}
              <AnimeSearch />
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