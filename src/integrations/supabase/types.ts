export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      hubspot_settings: {
        Row: {
          active_list_id: string
          created_at: string
          created_by: string | null
          field_mappings: Json | null
          id: string
          last_sync_at: string | null
          updated_at: string
        }
        Insert: {
          active_list_id: string
          created_at?: string
          created_by?: string | null
          field_mappings?: Json | null
          id?: string
          last_sync_at?: string | null
          updated_at?: string
        }
        Update: {
          active_list_id?: string
          created_at?: string
          created_by?: string | null
          field_mappings?: Json | null
          id?: string
          last_sync_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_visibility: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          show_email: boolean | null
          show_linkedin: boolean | null
          show_phone: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          show_email?: boolean | null
          show_linkedin?: boolean | null
          show_phone?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          show_email?: boolean | null
          show_linkedin?: boolean | null
          show_phone?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean | null
          Bio: string | null
          City: string | null
          "Company Name": string | null
          "Create Date": string | null
          Email: string | null
          "Email Domain": string | null
          "First Name": string | null
          "Full Name": string | null
          Headshot: string | null
          Industry: string | null
          "Job Title": string | null
          "Last Name": string | null
          LinkedIn: string | null
          "Member Since Date": string | null
          Membership: string | null
          "Phone Number": string | null
          "Profession - FSI": string | null
          record_id: number
          "State/Region": string | null
        }
        Insert: {
          active?: boolean | null
          Bio?: string | null
          City?: string | null
          "Company Name"?: string | null
          "Create Date"?: string | null
          Email?: string | null
          "Email Domain"?: string | null
          "First Name"?: string | null
          "Full Name"?: string | null
          Headshot?: string | null
          Industry?: string | null
          "Job Title"?: string | null
          "Last Name"?: string | null
          LinkedIn?: string | null
          "Member Since Date"?: string | null
          Membership?: string | null
          "Phone Number"?: string | null
          "Profession - FSI"?: string | null
          record_id: number
          "State/Region"?: string | null
        }
        Update: {
          active?: boolean | null
          Bio?: string | null
          City?: string | null
          "Company Name"?: string | null
          "Create Date"?: string | null
          Email?: string | null
          "Email Domain"?: string | null
          "First Name"?: string | null
          "Full Name"?: string | null
          Headshot?: string | null
          Industry?: string | null
          "Job Title"?: string | null
          "Last Name"?: string | null
          LinkedIn?: string | null
          "Member Since Date"?: string | null
          Membership?: string | null
          "Phone Number"?: string | null
          "Profession - FSI"?: string | null
          record_id?: number
          "State/Region"?: string | null
        }
        Relationships: []
      }
      resource_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          resource_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          resource_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          resource_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_comments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          resource_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          resource_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          resource_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resource_versions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          checked_out_at: string | null
          checked_out_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          parent_resource_id: string | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          checked_out_at?: string | null
          checked_out_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          parent_resource_id?: string | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          checked_out_at?: string | null
          checked_out_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          parent_resource_id?: string | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_parent_resource_id_fkey"
            columns: ["parent_resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_preferences: {
        Row: {
          id: string
          last_sync_timestamp: string | null
          two_way_sync: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          last_sync_timestamp?: string | null
          two_way_sync?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          last_sync_timestamp?: string | null
          two_way_sync?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_by_record_id: {
        Args: {
          record_id_param: number
        }
        Returns: {
          like: unknown
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_profile_by_record_id: {
        Args: {
          record_id_param: string
          update_data: Json
        }
        Returns: {
          like: unknown
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
