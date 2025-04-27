
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
          file_url: string
          id: string
          publication_year: number | null
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          file_url: string
          id?: string
          publication_year?: number | null
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          file_url?: string
          id?: string
          publication_year?: number | null
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
      static_page_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          static_page_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          static_page_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          static_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "static_page_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "static_page_categories_static_page_id_fkey"
            columns: ["static_page_id"]
            isOneToOne: false
            referencedRelation: "static_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      static_pages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          featured_image: string | null
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
          featured_image?: string | null
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
          featured_image?: string | null
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
          contact: string
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          name: string
          year_created: number
        }
        Insert: {
          bio?: string | null
          contact: string
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          name: string
          year_created: number
        }
        Update: {
          bio?: string | null
          contact?: string
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          name?: string
          year_created?: number
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
        Relationships: []
      }
    }
    Functions: {
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
    }
    Enums: {
      page_position: "top" | "sidebar" | "none"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      page_position: ["top", "sidebar", "none"],
    },
  },
} as const
