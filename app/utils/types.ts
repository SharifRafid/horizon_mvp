// types.ts
export interface ContentItem {
    id: string;
    title: string;
    url: string;
    link?: string;
    preview?: string;
    cover?: string;
    description?: string;
    type?: string;
    thumbnail?: string;
    publishedAt?: string;
    author?: string;
  }
  
  export interface Person {
    id: number;
    name: string;
    status: string;
    interests: string[];
    lat: number;
    lng: number;
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
  }

  export interface Resource {
    title: string;
    url: string;
    preview: string;
  }

  export interface Content extends ContentItem {
    type: string;
  }

  export type AuthMode = 'login' | 'signup' | 'profile';