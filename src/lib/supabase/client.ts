import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Graffiti } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton Supabase instance or null fallback for offline testing
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Pure dynamic state without mock static data
let memoryGraffitis: Graffiti[] = [];

/**
 * Fetch all published graffitis directly from Supabase
 */
export async function fetchGraffitis(): Promise<Graffiti[]> {
  if (!supabase) {
    console.warn('Supabase credentials not set in .env.local.');
    return memoryGraffitis;
  }

  try {
    const { data, error } = await supabase
      .from('graffitis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching graffitis from Supabase:', error.message);
      return memoryGraffitis;
    }

    if (data) {
      memoryGraffitis = data as Graffiti[];
      return memoryGraffitis;
    }
    return [];
  } catch (err) {
    console.error('Fetch graffitis failed:', err);
    return memoryGraffitis;
  }
}

/**
 * Upload image data URL to Supabase Storage bucket 'graffiti-art'
 * Returns the public CDN URL or data URL as fallback.
 */
export async function uploadArtworkImage(dataUrl: string, fileName: string): Promise<string> {
  if (!supabase) {
    return dataUrl;
  }

  try {
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const filePath = `artwork_${Date.now()}_${fileName}.png`;
    const { error } = await supabase.storage
      .from('graffiti-art')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload notice (falling back to data URL):', error.message);
      return dataUrl;
    }

    const { data } = supabase.storage.from('graffiti-art').getPublicUrl(filePath);
    return data.publicUrl || dataUrl;
  } catch (e) {
    console.warn('Failed to upload image blob:', e);
    return dataUrl;
  }
}

/**
 * Insert new Graffiti entry into Supabase PostgreSQL database
 */
export async function publishGraffitiToSupabase(newGraffiti: Omit<Graffiti, 'id' | 'created_at' | 'likes_count'>): Promise<Graffiti> {
  const fullGraffiti: Graffiti = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `g-${Date.now()}`,
    ...newGraffiti,
    likes_count: 0,
    created_at: new Date().toISOString(),
  };

  // Keep local array synced
  memoryGraffitis = [fullGraffiti, ...memoryGraffitis];

  if (!supabase) {
    return fullGraffiti;
  }

  try {
    const { data, error } = await supabase
      .from('graffitis')
      .insert([
        {
          id: fullGraffiti.id,
          user_id: newGraffiti.user_id,
          user_email: newGraffiti.user_email,
          user_name: newGraffiti.user_name,
          title: newGraffiti.title,
          latitude: newGraffiti.latitude,
          longitude: newGraffiti.longitude,
          image_url: newGraffiti.image_url,
          remix_parent_id: newGraffiti.remix_parent_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase DB publish error:', error.message);
      return fullGraffiti;
    }

    return data as Graffiti;
  } catch (err) {
    console.error('Publish error:', err);
    return fullGraffiti;
  }
}

/**
 * Increment graffiti like count
 */
export async function incrementGraffitiLike(id: string): Promise<number> {
  const target = memoryGraffitis.find((g) => g.id === id);
  if (target) {
    target.likes_count += 1;
  }

  if (!supabase) {
    return target ? target.likes_count : 1;
  }

  try {
    const currentLikes = target?.likes_count || 1;
    await supabase.from('graffitis').update({ likes_count: currentLikes }).eq('id', id);
    return currentLikes;
  } catch {
    return target?.likes_count || 1;
  }
}

/**
 * Subscribe to Supabase Realtime updates on 'graffitis' table
 */
export function subscribeToRealtimeGraffitis(onNewGraffiti: (graffiti: Graffiti) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:graffitis')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'graffitis' },
      (payload) => {
        if (payload.new) {
          const newG = payload.new as Graffiti;
          if (!memoryGraffitis.some((g) => g.id === newG.id)) {
            memoryGraffitis = [newG, ...memoryGraffitis];
          }
          onNewGraffiti(newG);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
