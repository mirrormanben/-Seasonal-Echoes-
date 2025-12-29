export interface SolarTerm {
  id: number;
  name: string; // Chinese name e.g., 立春
  enName: string; // English name e.g., Start of Spring
  date: string; // Approximate date e.g., "02-04"
  description: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface Poem {
  title: string;
  dynasty: string;
  author: string;
  content: string[]; // Lines of the poem
  translation: string; // English translation or modern Chinese explanation
  analysis: string; // Cultural context and appreciation
  mood: string; // e.g., "Melancholic", "Joyful"
  background: string; // Historical context of the poem
  authorIntro: string; // Brief biography of the author
  imageUrl?: string; // Base64 image data (loaded asynchronously)
}

export enum FetchState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}