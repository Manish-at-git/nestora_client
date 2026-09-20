export interface MarketplaceCategory {
  id: string;
  name: string;
  created_at?: string;
}

export type ListingType = "Sell" | "Buy" | "Give Away" | "Rent" | "Exchange";
export type ConditionState = "New" | "Like New" | "Excellent" | "Good" | "Fair";
export type ItemStatus = "Active" | "Draft" | "Sold" | "Pending";

export interface MarketplaceItem {
  id: string;
  association_id: string;
  user_id: string;
  owner_account_id?: string | null;
  category_id: string;
  category_name?: string;
  title: string;
  description?: string | null;
  price: number;
  condition_state: ConditionState | string;
  brand?: string | null;
  item_age?: string | null;
  location: string;
  contact_number: string;
  is_negotiable?: boolean;
  listing_type: ListingType | string;
  status: ItemStatus | string;
  views_count?: number;
  saves_count?: number;
  is_saved?: number | boolean;
  seller_name?: string;
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateMarketplaceItemPayload {
  title: string;
  description?: string;
  category_id: string;
  price: number;
  condition_state?: string;
  brand?: string;
  item_age?: string;
  location: string;
  contact_number: string;
  listing_type: string;
  is_negotiable?: boolean;
  status?: string;
  images: string[];
}

export interface UpdateMarketplaceItemPayload {
  title?: string;
  description?: string;
  category_id?: string;
  price?: number;
  condition_state?: string;
  brand?: string;
  item_age?: string;
  location?: string;
  contact_number?: string;
  listing_type?: string;
  is_negotiable?: boolean;
  status?: string;
  images?: string[];
}

export interface MarketplaceFilters {
  category_id?: string;
  condition?: string;
  min_price?: number | string;
  max_price?: number | string;
  is_negotiable?: boolean | string;
  status?: string;
  sort?: "Newest" | "Oldest";
  search?: string;
}

export interface MarketplaceChatMessage {
  id?: string;
  item_id: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  email?: string;
  message: string;
  is_mine?: boolean | number;
  created_at?: string;
}

export interface MarketplaceChatThread {
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  last_message?: string;
  last_message_at?: string;
}
