export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviews: number;
  status: string;
  address: string;
  phone: string | null;
  image: string | null;
  tags: string | null;
  website: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NearbyPlacePayload {
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviews: number;
  status: string;
  address: string;
  phone: string | null;
  image: string | null;
  tags: string | null;
  website: string | null;
  is_active: boolean;
}

export type NearbyPlaceMutationResult = { ok: boolean; message: string };
