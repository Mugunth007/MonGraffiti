export interface Graffiti {
  id: string;
  user_id: string;
  user_email?: string;
  user_name: string;
  title: string;
  latitude: number;
  longitude: number;
  image_url: string;
  likes_count: number;
  remix_parent_id?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_color: string;
  avatar_emoji: string;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export type DrawingTool = 'brush' | 'eraser' | 'text';

export interface DrawLine {
  tool: DrawingTool;
  points: number[];
  color: string;
  size: number;
}

export interface DrawText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}
