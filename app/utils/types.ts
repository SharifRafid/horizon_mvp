// types.ts
export interface ContentItem {
    title: string;
    url: string;
    link?: string;
    cover?: string;
    preview?: string;
  }
  
  export interface Person {
    id: number;
    lat: number;
    lng: number;
    name: string;
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