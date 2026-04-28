import React from 'react';
import { motion } from 'motion/react';
import { Anime } from '../types';
import { Play } from 'lucide-react';

interface Props {
  anime: Anime;
  onClick: (anime: Anime) => void;
  key?: React.Key;
}

export default function AnimeCard({ anime, onClick }: Props) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative cursor-pointer"
      onClick={() => onClick(anime)}
      id={`anime-card-${anime.id}`}
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-lg">
        <img
          src={anime.img}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="p-4 bg-sky-500 rounded-full shadow-lg shadow-sky-500/40">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </div>
      </div>
      
      <h3 className="mt-3 text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-sky-400 transition-colors uppercase tracking-tight">
        {anime.title}
      </h3>
    </motion.div>
  );
}
