import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AnimeResult {
  mal_id: number;
  title: string;
}

const AnimeSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // React Router hook for web navigation
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
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectAnime = (malId: number) => {
    // Navigate to the new info page, passing the ID in the URL
    // You will need to add this route to your App.tsx/main.tsx router setup
    navigate(`/info/${malId}`);
    
    // Clear search after selection
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded text-black"
        placeholder="Search for an anime..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {isSearching && <div className="text-sm text-gray-500 mt-1">Searching...</div>}

      {results.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((item) => (
            <li 
              key={item.mal_id}
              className="p-2 hover:bg-gray-100 cursor-pointer text-black border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectAnime(item.mal_id)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnimeSearch;