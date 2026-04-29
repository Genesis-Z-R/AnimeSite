import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, Star, Calendar, Film, Loader2, ArrowLeft } from 'lucide-react';

interface MalInfo {
  title: string;
  synopsis: string;
  images: { jpg: { large_image_url: string } };
  episodes: number;
  status: string;
  score: number;
  year: number;
  studios: { name: string }[];
  genres: { name: string }[];
}

const AnimeInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [info, setInfo] = useState<MalInfo | null>(null);
  const [isInfoLoading, setIsInfoLoading] = useState(true);

  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(true);
  
  // State for the episode tabs (001-100, etc.)
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchMalData = async () => {
      try {
        setIsInfoLoading(true);
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        if (!response.ok) throw new Error('Failed to fetch anime info');
        
        const json = await response.json();
        const animeData = json.data;
        setInfo(animeData);

        fetchScraperEpisodes(animeData.title);
      } catch (error) {
        console.error("Error fetching MAL data:", error);
      } finally {
        setIsInfoLoading(false);
      }
    };

    if (id) fetchMalData();
  }, [id]);

  const fetchScraperEpisodes = async (exactTitle: string) => {
    try {
      setIsEpisodesLoading(true);
      
      // Fixed: Inserted your Render backend URL
      const searchResponse = await fetch(`https://animesite-zx6n.onrender.com/api/v1/Search/${encodeURIComponent(exactTitle)}`);
      const searchData = await searchResponse.json();

      // Handle typical scraper array structures
      const resultsArray = Array.isArray(searchData) ? searchData : (searchData.results || []);

      const exactMatch = resultsArray.find(
        (result: any) => result.title.toLowerCase() === exactTitle.toLowerCase()
      );

      if (exactMatch) {
        // Handle variations in ID naming (id vs animeId)
        const matchId = exactMatch.id || exactMatch.animeId;
        const episodeResponse = await fetch(`https://animesite-zx6n.onrender.com/api/v1/info/${matchId}`);
        const episodeData = await episodeResponse.json();
        setEpisodes(episodeData.episodes || []);
      } else {
        console.log("No strict match found in scraper backend.");
      }
    } catch (error) {
      console.error("Error fetching scraper episodes:", error);
    } finally {
      setIsEpisodesLoading(false);
    }
  };

  // Helper function to chunk episodes into groups of 100
  const chunkedEpisodes = [];
  const chunkSize = 100;
  for (let i = 0; i < episodes.length; i += chunkSize) {
    chunkedEpisodes.push(episodes.slice(i, i + chunkSize));
  }

  if (isInfoLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-sky-500">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!info) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Error loading info.</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans relative selection:bg-sky-500/30 pb-20">
      
      {/* Cinematic Background overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${info.images.jpg.large_image_url})` }} 
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/95 to-[#020617] backdrop-blur-[10px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Search
        </button>

        {/* Top Section: MAL Metadata */}
        <div className="flex flex-col lg:flex-row gap-10">
          <img 
            src={info.images.jpg.large_image_url} 
            alt={info.title} 
            className="w-full md:w-72 lg:w-80 h-auto rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 object-cover"
          />
          
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              {info.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300 mb-8">
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Star className="w-4 h-4 text-yellow-500" /> {info.score || 'N/A'}
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Film className="w-4 h-4 text-sky-400" /> {info.episodes ? `${info.episodes} Episodes` : 'Unknown'}
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Calendar className="w-4 h-4 text-rose-400" /> {info.year || 'Unknown'}
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-emerald-400">
                {info.status}
              </span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">Synopsis</h3>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {info.synopsis}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {info.genres.map(g => (
                <span key={g.name} className="text-xs font-bold px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabbed Episodes Grid */}
        <div className="mt-4">
          <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-3">
            <PlayCircle className="w-6 h-6 text-sky-500" /> Select Episode
          </h2>
          
          {isEpisodesLoading ? (
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-sky-500" /> Retrieving streams...
            </div>
          ) : episodes.length > 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              
              {/* Tab Navigation */}
              {chunkedEpisodes.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-white/10">
                  {chunkedEpisodes.map((_, index) => {
                    const start = index * chunkSize + 1;
                    const end = Math.min((index + 1) * chunkSize, episodes.length);
                    const isActive = activeTab === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' 
                            : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                        }`}
                      >
                        {start.toString().padStart(3, '0')} - {end.toString().padStart(3, '0')}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Episode Grid for Active Tab */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {chunkedEpisodes[activeTab]?.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => navigate(`/watch/${ep.id}`)}
                    className="bg-slate-800/80 hover:bg-sky-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] text-slate-300 hover:text-white py-3 px-4 rounded-xl border border-white/5 hover:border-sky-400 transition-all font-bold flex flex-col items-center gap-1 group"
                  >
                    <span className="text-xs font-normal opacity-70 group-hover:opacity-100">EPISODE</span>
                    <span>{ep.number}</span>
                  </button>
                ))}
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-slate-400">
              Episodes are currently unavailable for this title.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnimeInfo;