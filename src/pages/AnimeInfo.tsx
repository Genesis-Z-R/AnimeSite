import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface MalInfo {
  title: string;
  synopsis: string;
  images: { jpg: { large_image_url: string } };
  episodes: number;
  status: string;
  aired: { string: string };
  studios: { name: string }[];
  genres: { name: string }[];
}

const AnimeInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for MAL Data (Top UI)
  const [info, setInfo] = useState<MalInfo | null>(null);
  const [isInfoLoading, setIsInfoLoading] = useState(true);

  // State for Scraper Data (Bottom UI)
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(true);

  useEffect(() => {
    const fetchMalData = async () => {
      try {
        setIsInfoLoading(true);
        // 1. Fetch exact data from Jikan API using the ID
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        if (!response.ok) throw new Error('Failed to fetch anime info');
        
        const json = await response.json();
        const animeData = json.data;
        setInfo(animeData);

        // 2. Trigger the background bridge to your backend scraper
        fetchScraperEpisodes(animeData.title);

      } catch (error) {
        console.error("Error fetching MAL data:", error);
      } finally {
        setIsInfoLoading(false);
      }
    };

    if (id) {
      fetchMalData();
    }
  }, [id]);

  const fetchScraperEpisodes = async (exactTitle: string) => {
    try {
      setIsEpisodesLoading(true);
      
      // Note: Replace this URL with your actual backend search endpoint
      const searchResponse = await fetch(`YOUR_BACKEND_URL/api/search?q=${encodeURIComponent(exactTitle)}`);
      const searchData = await searchResponse.json();

      // 3. Strict Equality Check to find the exact scraper slug
      const exactMatch = searchData.results.find(
        (result: any) => result.title.toLowerCase() === exactTitle.toLowerCase()
      );

      if (exactMatch) {
        // 4. Fetch the actual episodes using the matched scraper ID
        const episodeResponse = await fetch(`YOUR_BACKEND_URL/api/info/${exactMatch.id}`);
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

  if (isInfoLoading) {
    return <div className="text-white p-8">Loading Anime Info...</div>;
  }

  if (!info) {
    return <div className="text-white p-8">Error loading info.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Top Section: MAL Metadata */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <img 
          src={info.images.jpg.large_image_url} 
          alt={info.title} 
          className="w-full md:w-80 h-auto rounded-lg shadow-lg object-cover"
        />
        
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold text-yellow-500">{info.title}</h1>
          
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-800 p-4 rounded border border-gray-700">
            <p><span className="text-green-400 font-semibold">Episodes:</span> {info.episodes || 'Unknown'}</p>
            <p><span className="text-green-400 font-semibold">Status:</span> {info.status}</p>
            <p><span className="text-green-400 font-semibold">Aired:</span> {info.aired.string}</p>
            <p><span className="text-green-400 font-semibold">Studios:</span> {info.studios.map(s => s.name).join(', ')}</p>
            <p className="col-span-2"><span className="text-green-400 font-semibold">Genres:</span> {info.genres.map(g => g.name).join(', ')}</p>
          </div>

          <div>
            <h3 className="text-green-400 font-semibold mb-2">Plot Summary:</h3>
            <p className="text-gray-300 leading-relaxed">{info.synopsis}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Scraper Episodes Grid */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6">Episodes</h2>
        
        {isEpisodesLoading ? (
          <p className="text-gray-400">Loading streamable episodes from server...</p>
        ) : episodes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => navigate(`/watch/${ep.id}`)}
                className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded border border-gray-700 transition"
              >
                EP {ep.number}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-red-400">No episodes available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default AnimeInfo;