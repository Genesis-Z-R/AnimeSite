import axios from 'axios';
import { SearchResponse, EpisodeHandlerResponse, DecodeResponse } from '../types';

const API_BASE_URL = 'https://animesite-zx6n.onrender.com/api/v1';

export const api = {
  search: async (query: string): Promise<SearchResponse> => {
    const { data } = await axios.get<SearchResponse>(`${API_BASE_URL}/Search/${encodeURIComponent(query)}`);
    return data;
  },

  
  
  getEpisodeServers: async (id: string): Promise<EpisodeHandlerResponse> => {
    const { data } = await axios.get<EpisodeHandlerResponse>(`${API_BASE_URL}/AnimeEpisodeHandler/${id}`);
    return data;
  },
  
  decodeVideoLink: async (iframeUrl: string): Promise<DecodeResponse> => {
    const { data } = await axios.get<DecodeResponse>(`${API_BASE_URL}/decodevidstreamingiframeURL`, {
      params: { url: iframeUrl }
    });
    return data;
  }
};
