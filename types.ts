
export interface SearchSource {
  title: string;
  uri: string;
}

export interface SearchResponse {
  answer: string;
  sources: SearchSource[];
  query: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
}
