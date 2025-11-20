export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  email: string;
  link: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GalleryImage {
  url: string;
  caption: string;
  color: string;
}