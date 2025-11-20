import { Feature, TeamMember, GalleryImage } from './types';

export const FEATURES: Feature[] = [
  {
    icon: 'message-circle',
    title: 'Natural Conversations',
    description: 'Speaks 100+ languages including authentic Taglish and Bisaya.',
  },
  {
    icon: 'image',
    title: 'Vision Capable',
    description: 'Reads receipts, IDs, and product photos instantly.',
  },
  {
    icon: 'mic',
    title: 'Voice Understanding',
    description: 'Listens to customer audio messages and responds intelligently.',
  },
  {
    icon: 'brain-circuit',
    title: 'Contextual Memory',
    description: 'Remembers previous interactions for personalized service.',
  },
  {
    icon: 'clock',
    title: '24/7 Availability',
    description: 'No sleep, no breaks, no "holiday pay" required.',
  },
  {
    icon: 'rocket',
    title: '3-Day Setup',
    description: 'From contract to deployment in less than 72 hours.',
  },
];

export const TEAM: TeamMember[] = [
  {
    name: 'Marvin S. Villanueva',
    role: 'CEO & Creative Director',
    image: 'https://ibb.co/gMYcRNy7',
    email: 'marvin@orin.work',
    link: 'https://marvin.orin.work'
  },
  {
    name: 'John Romeo Albano',
    role: 'Business Officer',
    image: 'https://i.imgur.com/ce1YMPv.png',
    email: 'meow@orin.work',
    link: '#'
  },
  {
    name: 'Gene David Lampa',
    role: 'Beta Tester',
    image: 'https://ibb.co/Y701nhcn',
    email: 'gene@orin.work',
    link: '#'
  },
  {
    name: 'Roe Romeo Albano',
    role: 'Investor',
    image: 'https://preview.redd.it/taro-sakamoto-icon-cleaned-edit-and-remastered-by-me-two-v0-kgpamdq4m0rb1.png?width=640&crop=smart&auto=webp&s=405967562d8822280c7ed17334574e3e238720dc',
    email: 'roe@orin.work',
    link: '#'
  }
];

// STRICTLY ASIAN / FILIPINO CONTEXT IMAGES FOR USE CASES
export const GALLERY_IMAGES: GalleryImage[] = [
    { 
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop", 
      caption: "Online Sellers", 
      color: "#38F8A8" 
    }, // Asian woman portrait, cool vibe for online seller
    { 
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", 
      caption: "Agency Teams", 
      color: "#A855F7" 
    }, // Asian team collaborating
    { 
      url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop", 
      caption: "Client Meetings", 
      color: "#FF3366" 
    }, // Professional meeting
    { 
      url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop", 
      caption: "BPO / Support", 
      color: "#38F8A8" 
    }, // Asian BPO setting
    { 
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop", 
      caption: "Influencers", 
      color: "#A855F7" 
    }, // Asian woman confident
    { 
      url: "https://images.unsplash.com/photo-1507537297725-24a1c434666d?q=80&w=1974&auto=format&fit=crop", 
      caption: "Consultants", 
      color: "#FF3366" 
    }, // Professional setting
];

export const GREETINGS = [
  "Magkano po? 😭👉👈", "hm po sis 😩✨", "How much is this? 😌💵", "Tagpila?? 😌✨", 
  "HM HM HM 😭💸", "Is this available? 😌✔️", "Wala bang discount? 😭", "Laging ready si ORIN! 🤖"
];