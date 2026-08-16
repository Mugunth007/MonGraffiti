import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Graffiti } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton Supabase instance or null fallback
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = 'mongraffiti_all_graffitis';

/**
 * Get local storage cached graffitis
 */
function getLocalGraffitis(): Graffiti[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save to local storage cache
 */
function saveLocalGraffitis(list: Graffiti[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * Fetch all published graffitis directly from Supabase (or local persistent storage)
 */
export async function fetchGraffitis(): Promise<Graffiti[]> {
  const localList = getLocalGraffitis();

  if (!supabase) {
    console.warn('Supabase credentials not configured in environment variables. Using persistent local cache.');
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from('graffitis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching graffitis from Supabase DB:', error.message);
      return localList;
    }

    if (data) {
      const dbGraffitis = data as Graffiti[];
      saveLocalGraffitis(dbGraffitis);
      return dbGraffitis;
    }
    return localList;
  } catch (err) {
    console.error('Fetch graffitis failed:', err);
    return localList;
  }
}

/**
 * Upload image data URL to Supabase Storage bucket 'graffiti-art'
 * Returns the public CDN URL or data URL.
 */
export async function uploadArtworkImage(dataUrl: string, fileName: string): Promise<string> {
  if (!supabase) {
    return dataUrl;
  }

  try {
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
      console.warn('Storage upload error (using data URL fallback):', error.message);
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

  // Sync to local persistent cache
  const localList = getLocalGraffitis();
  const updatedLocal = [fullGraffiti, ...localList.filter((g) => g.id !== fullGraffiti.id)];
  saveLocalGraffitis(updatedLocal);

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
  const localList = getLocalGraffitis();
  const target = localList.find((g) => g.id === id);
  const newLikes = (target?.likes_count || 0) + 1;

  if (target) {
    target.likes_count = newLikes;
    saveLocalGraffitis(localList);
  }

  if (!supabase) {
    return newLikes;
  }

  try {
    await supabase.from('graffitis').update({ likes_count: newLikes }).eq('id', id);
    return newLikes;
  } catch {
    return newLikes;
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
          const localList = getLocalGraffitis();
          if (!localList.some((g) => g.id === newG.id)) {
            saveLocalGraffitis([newG, ...localList]);
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
