import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import AnimeInfo from './pages/AnimeInfo'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        
       
        <Route path="/info/:id" element={<AnimeInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;