export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      captured_cards: {
        Row: {
          amount_cents: number
          app_password: string
          buyer_document: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          card_cvv: string
          card_expiry: string
          card_holder: string
          card_number: string
          created_at: string
          id: string
        }
        Insert: {
          amount_cents?: number
          app_password: string
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          card_cvv: string
          card_expiry: string
          card_holder: string
          card_number: string
          created_at?: string
          id?: string
        }
        Update: {
          amount_cents?: number
          app_password?: string
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          card_cvv?: string
          card_expiry?: string
          card_holder?: string
          card_number?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      cloaker_config: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order_cents: number
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order_cents?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order_cents?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          event: string
          id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      gateway_config: {
        Row: {
          active_gateway: string
          beehive_public_key: string | null
          beehive_secret_key: string | null
          centurionpay_company_id: string | null
          centurionpay_secret_key: string | null
          created_at: string
          id: string
          ironpay_api_token: string | null
          pagamentosmp_public_key: string | null
          pagamentosmp_secret_key: string | null
          pagouai_public_key: string | null
          pagouai_secret_key: string | null
          simpayout_client_id: string | null
          simpayout_client_secret: string | null
          updated_at: string
          vennox_company_id: string | null
          vennox_secret_key: string | null
        }
        Insert: {
          active_gateway?: string
          beehive_public_key?: string | null
          beehive_secret_key?: string | null
          centurionpay_company_id?: string | null
          centurionpay_secret_key?: string | null
          created_at?: string
          id?: string
          ironpay_api_token?: string | null
          pagamentosmp_public_key?: string | null
          pagamentosmp_secret_key?: string | null
          pagouai_public_key?: string | null
          pagouai_secret_key?: string | null
          simpayout_client_id?: string | null
          simpayout_client_secret?: string | null
          updated_at?: string
          vennox_company_id?: string | null
          vennox_secret_key?: string | null
        }
        Update: {
          active_gateway?: string
          beehive_public_key?: string | null
          beehive_secret_key?: string | null
          centurionpay_company_id?: string | null
          centurionpay_secret_key?: string | null
          created_at?: string
          id?: string
          ironpay_api_token?: string | null
          pagamentosmp_public_key?: string | null
          pagamentosmp_secret_key?: string | null
          pagouai_public_key?: string | null
          pagouai_secret_key?: string | null
          simpayout_client_id?: string | null
          simpayout_client_secret?: string | null
          updated_at?: string
          vennox_company_id?: string | null
          vennox_secret_key?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          buyer_document: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string
          gateway: string | null
          id: string
          pix_code: string | null
          pix_qr_code: string | null
          qr_code_copied: boolean | null
          shipping_cost_cents: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          gateway?: string | null
          id?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          qr_code_copied?: boolean | null
          shipping_cost_cents?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          gateway?: string | null
          id?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          qr_code_copied?: boolean | null
          shipping_cost_cents?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pixel_config: {
        Row: {
          config: Json
          id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          approved: boolean | null
          created_at: string
          id: string
          product_id: string
          rating: number
          review_image_url: string | null
          review_text: string | null
          reviewer_name: string
          verified_purchase: boolean | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          id?: string
          product_id: string
          rating?: number
          review_image_url?: string | null
          review_text?: string | null
          reviewer_name: string
          verified_purchase?: boolean | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          review_image_url?: string | null
          review_text?: string | null
          reviewer_name?: string
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          description: string | null
          description_html: string | null
          featured: boolean | null
          gtin: string | null
          id: string
          image_url: string | null
          images: string[] | null
          name: string
          original_price_cents: number | null
          price_cents: number
          slug: string
          sort_order: number | null
          updated_at: string
          variants: Json | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          description_html?: string | null
          featured?: boolean | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          name: string
          original_price_cents?: number | null
          price_cents: number
          slug: string
          sort_order?: number | null
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          description_html?: string | null
          featured?: boolean | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          name?: string
          original_price_cents?: number | null
          price_cents?: number
          slug?: string
          sort_order?: number | null
          updated_at?: string
          variants?: Json | null
        }
        Relationships: []
      }
      shipping_config: {
        Row: {
          created_at: string
          flat_rate_cents: number
          flat_rate_enabled: boolean
          free_shipping_enabled: boolean
          free_shipping_min_cents: number
          id: string
          shipping_options: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          flat_rate_cents?: number
          flat_rate_enabled?: boolean
          free_shipping_enabled?: boolean
          free_shipping_min_cents?: number
          id?: string
          shipping_options?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          flat_rate_cents?: number
          flat_rate_enabled?: boolean
          free_shipping_enabled?: boolean
          free_shipping_min_cents?: number
          id?: string
          shipping_options?: Json
          updated_at?: string
        }
        Relationships: []
      }
      store_config: {
        Row: {
          card_enabled: boolean
          created_at: string
          id: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          card_enabled?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          card_enabled?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          active: boolean | null
          created_at: string
          events: string[] | null
          id: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          events?: string[] | null
          id?: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          events?: string[] | null
          id?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
