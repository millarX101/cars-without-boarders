export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          postcode: string | null;
          state: string | null;
          suburb: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          postcode?: string | null;
          state?: string | null;
          suburb?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          postcode?: string | null;
          state?: string | null;
          suburb?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      car_listings: {
        Row: {
          id: string;
          source: 'carsales' | 'gumtree';
          source_id: string;
          source_url: string;
          make: string;
          model: string;
          variant: string | null;
          year: number;
          price: number;
          odometer: number | null;
          transmission: string | null;
          fuel_type: string | null;
          body_type: string | null;
          drive_type: string | null;
          colour: string | null;
          engine_size: number | null;
          cylinders: number | null;
          seller_state: string;
          seller_postcode: string | null;
          seller_suburb: string | null;
          seller_type: string | null;
          seller_name: string | null;
          title: string;
          description: string | null;
          images: string[];
          features: string[];
          first_scraped_at: string;
          last_scraped_at: string;
          is_active: boolean;
          scrape_count: number;
        };
        Insert: {
          id?: string;
          source: 'carsales' | 'gumtree';
          source_id: string;
          source_url: string;
          make: string;
          model: string;
          variant?: string | null;
          year: number;
          price: number;
          odometer?: number | null;
          transmission?: string | null;
          fuel_type?: string | null;
          body_type?: string | null;
          drive_type?: string | null;
          colour?: string | null;
          engine_size?: number | null;
          cylinders?: number | null;
          seller_state: string;
          seller_postcode?: string | null;
          seller_suburb?: string | null;
          seller_type?: string | null;
          seller_name?: string | null;
          title: string;
          description?: string | null;
          images?: string[];
          features?: string[];
          first_scraped_at?: string;
          last_scraped_at?: string;
          is_active?: boolean;
          scrape_count?: number;
        };
        Update: {
          id?: string;
          source?: 'carsales' | 'gumtree';
          source_id?: string;
          source_url?: string;
          make?: string;
          model?: string;
          variant?: string | null;
          year?: number;
          price?: number;
          odometer?: number | null;
          transmission?: string | null;
          fuel_type?: string | null;
          body_type?: string | null;
          drive_type?: string | null;
          colour?: string | null;
          engine_size?: number | null;
          cylinders?: number | null;
          seller_state?: string;
          seller_postcode?: string | null;
          seller_suburb?: string | null;
          seller_type?: string | null;
          seller_name?: string | null;
          title?: string;
          description?: string | null;
          images?: string[];
          features?: string[];
          first_scraped_at?: string;
          last_scraped_at?: string;
          is_active?: boolean;
          scrape_count?: number;
        };
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          search_criteria: Json;
          delivery_postcode: string;
          delivery_state: string;
          email_alerts: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          search_criteria: Json;
          delivery_postcode: string;
          delivery_state: string;
          email_alerts?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          search_criteria?: Json;
          delivery_postcode?: string;
          delivery_state?: string;
          email_alerts?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_cars: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          delivery_postcode: string;
          delivery_state: string;
          calculated_costs: Json;
          total_delivered_price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          delivery_postcode: string;
          delivery_state: string;
          calculated_costs: Json;
          total_delivered_price: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          delivery_postcode?: string;
          delivery_state?: string;
          calculated_costs?: Json;
          total_delivered_price?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      transport_routes: {
        Row: {
          id: string;
          from_state: string;
          to_state: string;
          base_price: number;
          per_km_rate: number;
          estimated_days_min: number;
          estimated_days_max: number;
          notes: string | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          from_state: string;
          to_state: string;
          base_price: number;
          per_km_rate: number;
          estimated_days_min: number;
          estimated_days_max: number;
          notes?: string | null;
          last_updated?: string;
        };
        Update: {
          id?: string;
          from_state?: string;
          to_state?: string;
          base_price?: number;
          per_km_rate?: number;
          estimated_days_min?: number;
          estimated_days_max?: number;
          notes?: string | null;
          last_updated?: string;
        };
      };
      postcodes: {
        Row: {
          postcode: string;
          suburb: string;
          state: string;
          latitude: number | null;
          longitude: number | null;
        };
        Insert: {
          postcode: string;
          suburb: string;
          state: string;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          postcode?: string;
          suburb?: string;
          state?: string;
          latitude?: number | null;
          longitude?: number | null;
        };
      };
      scrape_jobs: {
        Row: {
          id: string;
          source: string;
          job_type: 'full' | 'incremental' | 'specific';
          status: 'pending' | 'running' | 'completed' | 'failed';
          search_query: string | null;
          listings_found: number;
          listings_new: number;
          listings_updated: number;
          listings_removed: number;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          job_type: 'full' | 'incremental' | 'specific';
          status?: 'pending' | 'running' | 'completed' | 'failed';
          search_query?: string | null;
          listings_found?: number;
          listings_new?: number;
          listings_updated?: number;
          listings_removed?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          job_type?: 'full' | 'incremental' | 'specific';
          status?: 'pending' | 'running' | 'completed' | 'failed';
          search_query?: string | null;
          listings_found?: number;
          listings_new?: number;
          listings_updated?: number;
          listings_removed?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
