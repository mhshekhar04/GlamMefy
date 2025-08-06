export interface Hairstyle {
  id: string;
  name: string;
  image: string;
  category: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  trending?: boolean;
}

export interface ColorSwatch {
  id: string;
  name: string;
  value: string;
  category: 'natural' | 'vibrant' | 'custom';
  image?: string;
}

export interface RecentStyle {
  id: string;
  styleName: string;
  image: string;
  timestamp: string;
}

export interface ScanProgress {
  progress: number;
  status: string;
  completed: boolean;
}
