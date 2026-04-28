export interface Episode {
  id: string;
}

export interface Anime {
  id: string;
  title: string;
  img: string;
  synopsis: string;
  episodes: Episode[];
}

export interface SearchResponse {
  search: Anime[];
}

export interface Server {
  name: string;
  iframe: string;
}

export interface AnimeMetadata {
  title: string;
  id: string;
  // Add other metadata fields if needed
}

export interface EpisodeHandlerResponse {
  0: {
    animeMetadata: AnimeMetadata;
    servers: Server[];
  };
}

export interface VideoOption {
  option: number;
  url: string;
}

export interface DecodeResponse {
  videos: VideoOption[];
}
