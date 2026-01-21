export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      commodities: {
        Row: {
          id: number;
          image: string | null;
          name: string;
        };
        Insert: {
          id?: never;
          image?: string | null;
          name: string;
        };
        Update: {
          id?: never;
          image?: string | null;
          name?: string;
        };
        Relationships: [];
      };
      commodity_translations: {
        Row: {
          commodity_id: number;
          language_code: string;
          name: string;
          needs_review: boolean | null;
          unit: string | null;
        };
        Insert: {
          commodity_id: number;
          language_code: string;
          name: string;
          needs_review?: boolean | null;
          unit?: string | null;
        };
        Update: {
          commodity_id?: number;
          language_code?: string;
          name?: string;
          needs_review?: boolean | null;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'commodity_translations_commodity_id_fkey';
            columns: ['commodity_id'];
            isOneToOne: false;
            referencedRelation: 'commodities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'commodity_translations_language_code_fkey';
            columns: ['language_code'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
        ];
      };
      deals: {
        Row: {
          buyer_id: string;
          buyer_status: Database['public']['Enums']['deal_status_enum'] | null;
          completed_at: string | null;
          created_at: string;
          farmer_id: string;
          farmer_status: Database['public']['Enums']['deal_status_enum'] | null;
          final_price: number;
          id: string;
          listing_id: string;
          offer_id: string;
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          buyer_status?: Database['public']['Enums']['deal_status_enum'] | null;
          completed_at?: string | null;
          created_at?: string;
          farmer_id: string;
          farmer_status?: Database['public']['Enums']['deal_status_enum'] | null;
          final_price: number;
          id?: string;
          listing_id: string;
          offer_id: string;
          updated_at?: string;
        };
        Update: {
          buyer_id?: string;
          buyer_status?: Database['public']['Enums']['deal_status_enum'] | null;
          completed_at?: string | null;
          created_at?: string;
          farmer_id?: string;
          farmer_status?: Database['public']['Enums']['deal_status_enum'] | null;
          final_price?: number;
          id?: string;
          listing_id?: string;
          offer_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deals_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_offer_id_fkey';
            columns: ['offer_id'];
            isOneToOne: false;
            referencedRelation: 'offers';
            referencedColumns: ['id'];
          },
        ];
      };
      device_tokens: {
        Row: {
          created_at: string;
          device_id: string;
          device_name: string | null;
          expo_push_token: string;
          id: string;
          last_used_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_id: string;
          device_name?: string | null;
          expo_push_token: string;
          id?: string;
          last_used_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_id?: string;
          device_name?: string | null;
          expo_push_token?: string;
          id?: string;
          last_used_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'device_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      districts: {
        Row: {
          created_at: string | null;
          id: number;
          name: string;
          state_id: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          name: string;
          state_id?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          name?: string;
          state_id?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'districts_state_id_fkey';
            columns: ['state_id'];
            isOneToOne: false;
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
        ];
      };
      languages: {
        Row: {
          code: string;
          name: string;
        };
        Insert: {
          code: string;
          name: string;
        };
        Update: {
          code?: string;
          name?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          commodity_id: number;
          created_at: string;
          expiry_timestamp: string;
          farmer_id: string;
          id: string;
          latitude: number;
          longitude: number;
          photos: string[] | null;
          price_currency: Database['public']['Enums']['currency_code_enum'] | null;
          price_per_unit: number;
          quantity: number;
          quantity_unit: string;
          status: Database['public']['Enums']['listing_status_enum'];
          title: string | null;
          updated_at: string;
        };
        Insert: {
          commodity_id: number;
          created_at?: string;
          expiry_timestamp: string;
          farmer_id: string;
          id?: string;
          latitude?: number;
          longitude?: number;
          photos?: string[] | null;
          price_currency?: Database['public']['Enums']['currency_code_enum'] | null;
          price_per_unit: number;
          quantity: number;
          quantity_unit: string;
          status?: Database['public']['Enums']['listing_status_enum'];
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          commodity_id?: number;
          created_at?: string;
          expiry_timestamp?: string;
          farmer_id?: string;
          id?: string;
          latitude?: number;
          longitude?: number;
          photos?: string[] | null;
          price_currency?: Database['public']['Enums']['currency_code_enum'] | null;
          price_per_unit?: number;
          quantity?: number;
          quantity_unit?: string;
          status?: Database['public']['Enums']['listing_status_enum'];
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_commodity_id_fkey';
            columns: ['commodity_id'];
            isOneToOne: false;
            referencedRelation: 'commodities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_farmer_id_fkey';
            columns: ['farmer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      mandi_prices: {
        Row: {
          arrival_date: string;
          commodity_id: number;
          grade: string | null;
          id: number;
          inserted_at: string | null;
          mandi_id: number;
          max_price: number;
          min_price: number;
          modal_price: number | null;
          source: string | null;
          variety: string | null;
        };
        Insert: {
          arrival_date: string;
          commodity_id: number;
          grade?: string | null;
          id?: never;
          inserted_at?: string | null;
          mandi_id: number;
          max_price: number;
          min_price: number;
          modal_price?: number | null;
          source?: string | null;
          variety?: string | null;
        };
        Update: {
          arrival_date?: string;
          commodity_id?: number;
          grade?: string | null;
          id?: never;
          inserted_at?: string | null;
          mandi_id?: number;
          max_price?: number;
          min_price?: number;
          modal_price?: number | null;
          source?: string | null;
          variety?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mandi_prices_commodity_id_fkey';
            columns: ['commodity_id'];
            isOneToOne: false;
            referencedRelation: 'commodities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mandi_prices_mandi_id_fkey';
            columns: ['mandi_id'];
            isOneToOne: false;
            referencedRelation: 'mandis';
            referencedColumns: ['id'];
          },
        ];
      };
      mandi_translations: {
        Row: {
          district: string;
          language_code: string;
          mandi_id: number;
          name: string;
          needs_review: boolean | null;
        };
        Insert: {
          district: string;
          language_code: string;
          mandi_id: number;
          name: string;
          needs_review?: boolean | null;
        };
        Update: {
          district?: string;
          language_code?: string;
          mandi_id?: number;
          name?: string;
          needs_review?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mandi_translations_language_code_fkey';
            columns: ['language_code'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'mandi_translations_mandi_id_fkey';
            columns: ['mandi_id'];
            isOneToOne: false;
            referencedRelation: 'mandis';
            referencedColumns: ['id'];
          },
        ];
      };
      mandis: {
        Row: {
          district_id: number | null;
          id: number;
          name: string;
          state_id: number | null;
        };
        Insert: {
          district_id?: number | null;
          id?: never;
          name: string;
          state_id?: number | null;
        };
        Update: {
          district_id?: number | null;
          id?: never;
          name?: string;
          state_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mandis_district_id_fkey';
            columns: ['district_id'];
            isOneToOne: false;
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mandis_state_id_fkey';
            columns: ['state_id'];
            isOneToOne: false;
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_templates: {
        Row: {
          body: string;
          language_code: string;
          title: string;
          type: string;
        };
        Insert: {
          body: string;
          language_code: string;
          title: string;
          type: string;
        };
        Update: {
          body?: string;
          language_code?: string;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_templates_language_code_fkey';
            columns: ['language_code'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          data: Json | null;
          id: string;
          provider: string;
          sent_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          data?: Json | null;
          id?: string;
          provider?: string;
          sent_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          data?: Json | null;
          id?: string;
          provider?: string;
          sent_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      offers: {
        Row: {
          buyer_id: string;
          buyer_status: Database['public']['Enums']['offer_status_enum'] | null;
          created_at: string;
          farmer_id: string;
          farmer_status: Database['public']['Enums']['offer_status_enum'] | null;
          id: string;
          listing_id: string;
          message: string | null;
          offer_id: string | null;
          proposed_price: number;
          status: Database['public']['Enums']['offer_status_enum'];
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          buyer_status?: Database['public']['Enums']['offer_status_enum'] | null;
          created_at?: string;
          farmer_id: string;
          farmer_status?: Database['public']['Enums']['offer_status_enum'] | null;
          id?: string;
          listing_id: string;
          message?: string | null;
          offer_id?: string | null;
          proposed_price: number;
          status?: Database['public']['Enums']['offer_status_enum'];
          updated_at?: string;
        };
        Update: {
          buyer_id?: string;
          buyer_status?: Database['public']['Enums']['offer_status_enum'] | null;
          created_at?: string;
          farmer_id?: string;
          farmer_status?: Database['public']['Enums']['offer_status_enum'] | null;
          id?: string;
          listing_id?: string;
          message?: string | null;
          offer_id?: string | null;
          proposed_price?: number;
          status?: Database['public']['Enums']['offer_status_enum'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'offers_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offers_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'offers_offer_id_fkey';
            columns: ['offer_id'];
            isOneToOne: false;
            referencedRelation: 'offers';
            referencedColumns: ['id'];
          },
        ];
      };
      places: {
        Row: {
          created_at: string | null;
          id: string;
          latitude: number;
          longitude: number;
          name: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          latitude: number;
          longitude: number;
          name?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          latitude?: number;
          longitude?: number;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'places_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      ratings: {
        Row: {
          comment: string | null;
          created_at: string;
          deal_id: string;
          id: string;
          ratee_id: string;
          rater_id: string;
          score: number;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          deal_id: string;
          id?: string;
          ratee_id: string;
          rater_id: string;
          score: number;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          deal_id?: string;
          id?: string;
          ratee_id?: string;
          rater_id?: string;
          score?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'ratings_deal_id_fkey';
            columns: ['deal_id'];
            isOneToOne: false;
            referencedRelation: 'deals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_ratee_id_fkey';
            columns: ['ratee_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_rater_id_fkey';
            columns: ['rater_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      state_translations: {
        Row: {
          language_code: string;
          name: string;
          needs_review: boolean | null;
          state_id: number;
        };
        Insert: {
          language_code: string;
          name: string;
          needs_review?: boolean | null;
          state_id: number;
        };
        Update: {
          language_code?: string;
          name?: string;
          needs_review?: boolean | null;
          state_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'state_translations_language_code_fkey';
            columns: ['language_code'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'state_translations_state_id_fkey';
            columns: ['state_id'];
            isOneToOne: false;
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
        ];
      };
      states: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: never;
          name: string;
        };
        Update: {
          id?: never;
          name?: string;
        };
        Relationships: [];
      };
      sync_state: {
        Row: {
          key: string;
          value: Json | null;
        };
        Insert: {
          key: string;
          value?: Json | null;
        };
        Update: {
          key?: string;
          value?: Json | null;
        };
        Relationships: [];
      };
      user_commodities: {
        Row: {
          commodity_id: number;
          created_at: string | null;
          purpose: Database['public']['Enums']['purpose_enum'];
          user_id: string;
        };
        Insert: {
          commodity_id: number;
          created_at?: string | null;
          purpose: Database['public']['Enums']['purpose_enum'];
          user_id: string;
        };
        Update: {
          commodity_id?: number;
          created_at?: string | null;
          purpose?: Database['public']['Enums']['purpose_enum'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_commodities_commodity_id_fkey';
            columns: ['commodity_id'];
            isOneToOne: false;
            referencedRelation: 'commodities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_commodities_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_mandis: {
        Row: {
          created_at: string | null;
          mandi_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          mandi_id: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          mandi_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_mandis_duplicate_mandi_id_fkey';
            columns: ['mandi_id'];
            isOneToOne: false;
            referencedRelation: 'mandis';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_mandis_duplicate_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_registrations: {
        Row: {
          created_at: string | null;
          id: string;
          is_completed: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_completed?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_completed?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_registrations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          address: string | null;
          average_rating: number | null;
          business_name: string | null;
          created_at: string;
          deleted_at: string | null;
          district_id: number | null;
          farm_name: string | null;
          full_name: string;
          id: string;
          language_preference: string;
          phone_number: string;
          preferred_currency: Database['public']['Enums']['currency_code_enum'] | null;
          price_unit: Database['public']['Enums']['price_unit_enum'] | null;
          profile_photo_url: string | null;
          rating_count: number;
          role: Database['public']['Enums']['role_enum'];
          state_id: number | null;
          status: Database['public']['Enums']['user_status_enum'];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          average_rating?: number | null;
          business_name?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          district_id?: number | null;
          farm_name?: string | null;
          full_name: string;
          id?: string;
          language_preference?: string;
          phone_number: string;
          preferred_currency?: Database['public']['Enums']['currency_code_enum'] | null;
          price_unit?: Database['public']['Enums']['price_unit_enum'] | null;
          profile_photo_url?: string | null;
          rating_count?: number;
          role?: Database['public']['Enums']['role_enum'];
          state_id?: number | null;
          status?: Database['public']['Enums']['user_status_enum'];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          average_rating?: number | null;
          business_name?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          district_id?: number | null;
          farm_name?: string | null;
          full_name?: string;
          id?: string;
          language_preference?: string;
          phone_number?: string;
          preferred_currency?: Database['public']['Enums']['currency_code_enum'] | null;
          price_unit?: Database['public']['Enums']['price_unit_enum'] | null;
          profile_photo_url?: string | null;
          rating_count?: number;
          role?: Database['public']['Enums']['role_enum'];
          state_id?: number | null;
          status?: Database['public']['Enums']['user_status_enum'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_district_id_fkey';
            columns: ['district_id'];
            isOneToOne: false;
            referencedRelation: 'districts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_language_fkey';
            columns: ['language_preference'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'users_state_id_fkey';
            columns: ['state_id'];
            isOneToOne: false;
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_notifications: {
        Args: { batch_size: number };
        Returns: {
          body: string;
          created_at: string;
          data: Json | null;
          id: string;
          provider: string;
          sent_at: string | null;
          title: string;
          user_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'notifications';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      insert_notification:
        | {
            Args: {
              p_body: string;
              p_data?: Json;
              p_title: string;
              p_user_id: string;
            };
            Returns: string;
          }
        | {
            Args: {
              p_body?: string;
              p_data?: Json;
              p_title?: string;
              p_type: string;
              p_user_id: string;
            };
            Returns: string;
          };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      currency_code_enum: 'INR' | 'USD' | 'CAD' | 'CNY' | 'JPY' | 'GBP';
      deal_status_enum: 'accepted' | 'completed' | 'cancelled' | 'pending';
      listing_status_enum: 'active' | 'expired' | 'cancelled' | 'deleted' | 'sold_out';
      offer_status_enum: 'pending' | 'countered' | 'accepted' | 'declined' | 'canceled';
      price_type_enum: 'fixed' | 'negotiable';
      price_unit_enum: 'quintal' | '20kg' | 'kg' | 'ton';
      purpose_enum: 'grow' | 'buy';
      role_enum: 'admin' | 'farmer' | 'buyer';
      user_status_enum: 'active' | 'suspended' | 'deleted';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      currency_code_enum: ['INR', 'USD', 'CAD', 'CNY', 'JPY', 'GBP'],
      deal_status_enum: ['accepted', 'completed', 'cancelled', 'pending'],
      listing_status_enum: ['active', 'expired', 'cancelled', 'deleted', 'sold_out'],
      offer_status_enum: ['pending', 'countered', 'accepted', 'declined', 'canceled'],
      price_type_enum: ['fixed', 'negotiable'],
      price_unit_enum: ['quintal', '20kg', 'kg', 'ton'],
      purpose_enum: ['grow', 'buy'],
      role_enum: ['admin', 'farmer', 'buyer'],
      user_status_enum: ['active', 'suspended', 'deleted'],
    },
  },
} as const;
