import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Server as ServerIcon, Layout, Monitor, Search, PlayCircle, Heart } from 'lucide-react';
import { api } from '../services/api';
import { Server } from '../types';
import GlassBox from '../components/GlassBox';
import AnimePlayer from '../components/AnimePlayer';

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Catch the anime data passed from the Home page search click
  const location = useLocation();
  const passedAnime = location.state?.anime;
  
  const [servers, setServers] = useState<Server[]>([]);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isFavorite, setIsFavorite] = useState(false);

  // --- Real-time Search Logic ---
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

  // --- Episode Fetch Logic ---
  useEffect(() => {
    if (!id) return;
    
    const initWatch = async () => {
      setLoading(true);
      setError(null);
      setVideoUrl(null); 
      
      try {
        const episodeId = id.includes('-episode-') ? id : `${id}-episode-1`;
        const episodeData = await api.getEpisodeServers(episodeId);
        
        const rawServerList = episodeData.anime[0].servers;
        
        // 1. Process the servers to identify Sub vs Dub
        const processedServers = rawServerList.map((s: Server) => {
          let isSub = false;
          try {
            const iframeUrlObj = new URL(s.iframe);
            isSub = !!(iframeUrlObj.searchParams.get('sub') || iframeUrlObj.searchParams.get('caption_1'));
          } catch (e) { }
          
          return {
            ...s,
            name: `${s.name.trim()} ${isSub ? '(Sub)' : '(Dub)'}`
          };
        });

        // 2. Deduplicate using the NEW distinct names
        const uniqueServers = Array.from(
          new Map(processedServers.map((s: Server) => [s.name, s])).values()
        ) as Server[];
        
        setServers(uniqueServers);
        const md = episodeData.anime[0].animeMetadata || episodeData.anime[0];
        setMetadata(md);
        
        // Check if this show is already favorited
        const baseId = id.replace(/-episode-\d+$/, '');
        const storedFavs = JSON.parse(localStorage.getItem('ramsey-favorites') || '[]');
        setIsFavorite(storedFavs.some((f: any) => (f.id || f.animeId) === baseId));

        if (uniqueServers.length > 0) {
          handleServerSelect(uniqueServers[0]);
        } else {
          setError('No servers available for this episode.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to load episode data.');
        setLoading(false);
      }
    };

    initWatch();
  }, [id]);

  // --- Video Server Selection Logic ---
  const handleServerSelect = async (server: Server) => {
    setLoading(true);
    setCurrentServer(server);
    try {
      let extractedSub = null;
      try {
        const iframeUrlObj = new URL(server.iframe);
        extractedSub = iframeUrlObj.searchParams.get('sub') || iframeUrlObj.searchParams.get('caption_1');
      } catch (e) { }

      if (extractedSub) {
        setSubtitleUrl(extractedSub);
      } else {
        setSubtitleUrl(null);
      }

      const decodeData = await api.decodeVideoLink(server.iframe);
      if (decodeData.videos && decodeData.videos.length > 0) {
        const rawM3u8Url = decodeData.videos[0].url;
        // Pointing to your live Render backend proxy
        setVideoUrl(`https://animesite-zx6n.onrender.com/api/v1/proxy?url=${encodeURIComponent(rawM3u8Url)}`);
      } else {
        setError('Could not extract video stream from this server.');
      }
    } catch (err) {
      console.error('Decode error:', err);
      setError('Failed to decode video stream.');
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle Favorite Logic ---
  const toggleFavorite = () => {
    const baseId = id?.replace(/-episode-\d+$/, '');
    if (!baseId) return;

    const storedFavs = JSON.parse(localStorage.getItem('ramsey-favorites') || '[]');
    const exists = storedFavs.some((f: any) => (f.id || f.animeId) === baseId);

    let newFavorites;
    if (exists) {
      newFavorites = storedFavs.filter((f: any) => (f.id || f.animeId) !== baseId);
      setIsFavorite(false);
    } else {
      newFavorites = [...storedFavs, {
        id: baseId,
        title: passedAnime?.title || metadata?.title || baseId.replace(/-/g, ' ').toUpperCase(),
        img: passedAnime?.img || passedAnime?.image || metadata?.image || metadata?.img || ''
      }];
      setIsFavorite(true);
    }
    localStorage.setItem('ramsey-favorites', JSON.stringify(newFavorites));
  };

  // --- Error Screen ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <GlassBox className="max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><ServerIcon className="w-10 h-10 text-red-500" /></div>
          <h2 className="text-2xl font-bold mb-4">Stream Unavailable</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-all">Go Back Home</button>
        </GlassBox>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-[100] px-8 h-16 flex items-center justify-between border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="text-2xl font-black tracking-tighter bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            RAMSEY<span className="text-white font-light uppercase">ANIME</span>
          </button>
        </div>
        
        <div className="flex-1"></div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block w-64 lg:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anime..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            
            {searchQuery && (
              <div className="absolute top-full right-0 mt-2 w-full min-w-[300px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(anime => {
                    const identifier = anime.id || anime.animeId || (anime.episodes && anime.episodes[0]?.id);
                    return (
                      <button 
                        key={identifier}
                        onClick={() => {
                          navigate(`/watch/${identifier}`, { state: { anime } });
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-3 hover:bg-white/5 flex gap-3 items-center transition-colors border-b border-white/5 last:border-0"
                      >
                        <img src={anime.img || anime.image} alt={anime.title} className="w-8 h-10 object-cover rounded" />
                        <span className="text-sm font-medium line-clamp-2">{anime.title}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">No results found</div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border border-white/5 whitespace-nowrap">
            Home
          </button>
        </div>
      </nav>

      <main className={theaterMode ? "flex-1 w-full relative z-0" : "flex-1 max-w-7xl mx-auto px-6 py-10 w-full relative z-0"}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Player + Metadata + Servers */}
          <div className={theaterMode ? "lg:col-span-12" : "lg:col-span-8"}>
            <div className="relative group z-10">
              {loading && !videoUrl ? (
                <div className="w-full aspect-video rounded-2xl bg-white/5 animate-pulse flex items-center justify-center border border-white/10">
                   <div className="text-cyan-500 animate-bounce"><Monitor className="w-12 h-12" /></div>
                </div>
              ) : videoUrl ? (
                <AnimePlayer 
                  url={videoUrl} 
                  subtitleUrl={subtitleUrl}
                  id={id || 'unknown'}
                  className={theaterMode ? "w-full h-[80vh] bg-black" : "w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,242,254,0.1)] border border-white/10"}
                />
              ) : null}

              <button onClick={() => setTheaterMode(!theaterMode)} className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Layout className="w-5 h-5" />
              </button>
            </div>

            <div className={theaterMode ? "px-6 py-8 max-w-7xl mx-auto" : "mt-8"}>
              
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold">{passedAnime?.title || metadata?.title || 'Watch Episode'}</h2>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full border transition-all ${
                    isFavorite 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <GlassBox className="px-4 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium uppercase tracking-tight">Active: {currentServer?.name}</span>
                </GlassBox>
                <div className="text-gray-500 text-sm italic">Episode ID: {id}</div>
              </div>
            </div>

            {!theaterMode && (
              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Streaming Servers</h3>
                <div className="flex flex-wrap gap-3">
                  {servers.map((server, index) => (
                    <button
                      key={`${server.name}-${index}`}
                      onClick={() => handleServerSelect(server)}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${
                        currentServer?.name === server.name ? 'bg-sky-500/10 border-sky-500/50 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${currentServer?.name === server.name ? 'bg-sky-500 animate-pulse' : 'bg-slate-600'}`}></div>
                      <span className="font-medium text-sm">{server.name}</span>
                      <span className="text-[10px] font-bold uppercase opacity-50 ml-2">1080p</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Episode List */}
          {!theaterMode && (
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {(() => {
                let displayEpisodes = metadata?.episodes && metadata.episodes.length > 0 
                  ? metadata.episodes 
                  : [];
                
                if (displayEpisodes.length === 0 && id) {
                  const baseId = id.replace(/-episode-\d+$/, '');
                  
                  // Try to pull the real count from the homepage data
                  let maxEpisodes = Number(passedAnime?.totalEpisodes) || 
                                    passedAnime?.episodes?.length || 
                                    Number(passedAnime?.episodeNum) || 
                                    (metadata?.totalEpisodes > 0 ? metadata.totalEpisodes : 0);
                  
                  // Identify the episode the user is currently watching
                  const currentEpMatch = id.match(/-episode-(\d+)$/);
                  const currentEpNum = currentEpMatch ? parseInt(currentEpMatch[1], 10) : 1;
                  
                  // Fallback: Ensure the grid covers the current episode plus a few extra
                  if (!maxEpisodes || maxEpisodes < currentEpNum) {
                    maxEpisodes = Math.max(24, currentEpNum + 5); 
                  }

                  displayEpisodes = Array.from({ length: maxEpisodes }, (_, i) => ({
                    id: `${baseId}-episode-${i + 1}`,
                    number: i + 1
                  }));
                }

                return (
                  <GlassBox className="p-6 max-h-[600px] flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                      Episodes ({displayEpisodes.length})
                    </h3>
                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                      {displayEpisodes.map((ep: any, index: number) => {
                        const isCurrent = id === ep.id || (!id?.includes('episode') && index === 0);
                        return (
                          <button
                            key={ep.id}
                            onClick={() => navigate(`/watch/${ep.id}`)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              isCurrent ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <PlayCircle className={`w-4 h-4 flex-shrink-0 ${isCurrent ? 'text-sky-400' : 'text-slate-500'}`} />
                            <span className="text-sm font-medium line-clamp-1">
                               {ep.number ? `Episode ${ep.number}` : `Episode ${index + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </GlassBox>
                );
              })()}

            </div>
          )}
        </div>
      </main>

      <footer className="h-8 flex items-center px-8 bg-sky-950/20 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] border-t border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 leading-none">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            API Connected: {loading ? 'Fetching' : 'OK'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sky-400">{videoUrl ? 'Stream Ready' : 'Initializing...'}</span>
        </div>
      </footer>
    </div>
  );
}