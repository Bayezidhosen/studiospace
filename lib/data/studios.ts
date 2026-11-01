
import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Clapperboard,
  Mic2,
  Music2,
  Palette,
} from "lucide-react";

export type Studio = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: string;
  location: string;
  image: string;
  tag: string;
  description: string;
  features: string[];
  deposit?: number;
  hostName?: string;
};

export const studios: Studio[] = [
  {
    id: "studio-1",
    name: "The White Frame Studio",
    category: "Photo Studio",
    price: 85,
    rating: "4.9",
    location: "New York, NY",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    tag: "MOST POPULAR",
    description:
      "A bright, minimal daylight studio with a full white cyclorama wall, perfect for product shoots, portraits and editorial work.",
    features: [
      "White cyclorama wall",
      "Professionally grade lighting grid",
      "Makeup & styling station",
      "Free on-site parking",
    ],
  },
  {
    id: "studio-2",
    name: "Echo Podcast Lounge",
    category: "Podcast Room",
    price: 60,
    rating: "4.8",
    location: "Brooklyn, NY",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=85",
    tag: "TOP RATED",
    description:
      "An acoustically treated two-seat podcast lounge with broadcast-grade microphones and built-in multitrack recording.",
    features: [
      "Acoustic panel treatment",
      "Shure SM7B microphone kit",
      "4K multi-cam recording",
      "Live streaming setup",
    ],
  },
  {
    id: "studio-3",
    name: "The Sound Lab",
    category: "Music Suite",
    price: 95,
    rating: "5.0",
    location: "Los Angeles, CA",
    image:
      "https://images.unsplash.com/photo-1593078166036-9d7b7a5a9c8c?auto=format&fit=crop&w=900&q=85",
    tag: "PREMIUM",
    description:
      "A fully isolated tracking room with analog outboard gear, a grand piano and an experienced on-site engineer on request.",
    features: [
      "ISO-treated tracking room",
      "Yamaha grand piano",
      "Analog outboard selection",
      "On-call sound engineer",
    ],
  },
  {
    id: "studio-4",
    name: "Monochrome Space",
    category: "Creative Studio",
    price: 75,
    rating: "4.9",
    location: "Chicago, IL",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
    tag: "TRENDING",
    description:
      "A flexible black-and-white multi-use space that converts between photo, video and content days in minutes.",
    features: [
      "Black & white backdrop bays",
      "Modular furniture layout",
      "Fiber internet connection",
      "Kitchenette & lounge",
    ],
  },
  {
    id: "studio-5",
    name: "Frame One Production",
    category: "Film Stage",
    price: 120,
    rating: "4.9",
    location: "Austin, TX",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    tag: "PRO CHOICE",
    description:
      "A purpose-built film stage with 14ft ceilings, a 20x20ft white cyc, grip truck access and a green room.",
    features: [
      "20x20ft white cyc",
      "14ft ceiling clearance",
      "Grip & electric package",
      "Dedicated green room",
    ],
  },
  {
    id: "studio-6",
    name: "The Creative Corner",
    category: "Art Workshop",
    price: 55,
    rating: "4.7",
    location: "Seattle, WA",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85",
    tag: "NEW SPACE",
    description:
      "A light-filled workshop space with long workbenches, easels and washable floors, ideal for classes and craft sessions.",
    features: [
      "Natural north-facing light",
      "12 work benches",
      "Sinks & washable floors",
      "Community gallery wall",
    ],
  },
];

export const slides = [
  {
    eyebrow: "YOUR CREATIVE SPACE AWAITS",
    title: "Make Room for",
    highlight: "Creativity.",
    description:
      "Discover extraordinary studios and turn your next big idea into something unforgettable.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=85",
  },
  {
    eyebrow: "BUILT FOR STORYTELLERS",
    title: "Create Beyond",
    highlight: "Limits.",
    description:
      "From cinematic production to intimate podcast sessions, find the perfect space for your vision.",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=2000&q=85",
  },
  {
    eyebrow: "HOST YOUR CREATIVE SPACE",
    title: "Your Studio.",
    highlight: "Your Stage.",
    description:
      "Share your creative workspace with a community of creators and unlock its potential.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=85",
  },
];

export type Category = {
  name: string;
  count: string;
  icon: LucideIcon;
  image: string;
};

export const categories: Category[] = [
  {
    name: "Photo Studios",
    count: "120+ Spaces",
    icon: Camera,
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Sound Stages",
    count: "85+ Spaces",
    icon: Clapperboard,
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Podcast Rooms",
    count: "60+ Spaces",
    icon: Mic2,
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Music Suites",
    count: "95+ Spaces",
    icon: Music2,
    image:
      "https://images.unsplash.com/photo-1593078166036-9d7b7a5a9c8c?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Art Workshops",
    count: "45+ Spaces",
    icon: Palette,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=85",
  },
];
