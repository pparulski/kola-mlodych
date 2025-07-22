export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      article_galleries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          show_in_menu: boolean | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          show_in_menu?: boolean | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          show_in_menu?: boolean | null
          slug?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          url?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ebook_type: string
          file_url: string
          id: string
          page_count: number | null
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ebook_type?: string
          file_url: string
          id?: string
          page_count?: number | null
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ebook_type?: string
          file_url?: string
          id?: string
          page_count?: number | null
          title?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          gallery_id: string
          id: string
          position: number
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          position?: number
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "article_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          success: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          success?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          success?: boolean
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_slug: string | null
          created_at: string
          icon: string | null
          id: string
          path: string
          position: number
          resource_id: string | null
          title: string
          type: string
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          path: string
          position: number
          resource_id?: string | null
          title: string
          type?: string
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          path?: string
          position?: number
          resource_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      menu_positions: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          position: number
          resource_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id: string
          position: number
          resource_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          position?: number
          resource_id?: string | null
          type?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          date: string | null
          featured_image: string | null
          id: string
          short_url: string | null
          slug: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          featured_image?: string | null
          id?: string
          short_url?: string | null
          slug: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          featured_image?: string | null
          id?: string
          short_url?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      news_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          news_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          news_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          news_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_categories_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_categories_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      static_pages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          position_type: Database["public"]["Enums"]["page_position"] | null
          show_in_sidebar: boolean | null
          sidebar_position: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          position_type?: Database["public"]["Enums"]["page_position"] | null
          show_in_sidebar?: boolean | null
          sidebar_position?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          position_type?: Database["public"]["Enums"]["page_position"] | null
          show_in_sidebar?: boolean | null
          sidebar_position?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      unions: {
        Row: {
          bio: string | null
          city: string | null
          contact: string
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          name: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          contact: string
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          contact?: string
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      news_preview: {
        Row: {
          category_ids: string[] | null
          category_names: string[] | null
          created_at: string | null
          date: string | null
          featured_image: string | null
          id: string | null
          preview_content: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          category_ids?: never
          category_names?: never
          created_at?: string | null
          date?: string | null
          featured_image?: string | null
          id?: string | null
          preview_content?: never
          slug?: string | null
          title?: string | null
        }
        Update: {
          category_ids?: never
          category_names?: never
          created_at?: string | null
          date?: string | null
          featured_image?: string | null
          id?: string | null
          preview_content?: never
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      convert_polish_chars: {
        Args: { input_text: string }
        Returns: string
      }
      generate_unique_slug: {
        Args: { title: string; attempt?: number }
        Returns: string
      }
      get_daily_login_attempts: {
        Args: { ip_addr: string; hours_ago: number }
        Returns: number
      }
      get_recent_login_attempts: {
        Args: { ip_addr: string; minutes_ago: number }
        Returns: number
      }
      get_updated_articles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          slug: string
          date: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      record_login_attempt: {
        Args: { ip_addr: string; was_successful: boolean }
        Returns: undefined
      }
      search_news: {
        Args: { search_term: string; page_limit: number; page_offset: number }
        Returns: Json
      }
      update_all_news_slugs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      page_position: "top" | "sidebar" | "none"
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
    Enums: {
      page_position: ["top", "sidebar", "none"],
    },
  },
} as const
