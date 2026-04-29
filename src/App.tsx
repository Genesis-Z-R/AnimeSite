import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
// 1. Import the new page
import AnimeInfo from './pages/AnimeInfo'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        
        // 2. Add the new route. The ":id" part is crucial for passing the MAL ID.
        <Route path="/info/:id" element={<AnimeInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;