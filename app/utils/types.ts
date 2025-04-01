// types.ts
export interface ContentItem {
    title: string;
    url: string;
    link?: string;
    preview?: string;
    cover?: string;
  }
  
  export interface Person {
    id: number;
    name: string;
    lat: number;
    lng: number;
    avatar?: string;
    status?: string;
    interests?: string[];
  }
  
  export interface Passion {
    title: string;
    desc: string;
  }
  
  export interface Message {
    user: string;
    text: string;
    time: string;
  }
  
  export interface Location {
    lat: number;
    lng: number;
    avatar?: string;
  }

  export interface Resource {
    title: string;
    url: string;
    preview: string;
  }

  export interface Content {
    type: 'video' | 'article' | 'book';
    title: string;
    description: string;
    url: string;
    thumbnail?: string;
    author?: string;
    publishedAt?: string;
  }