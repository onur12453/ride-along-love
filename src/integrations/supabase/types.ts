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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: number
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: never
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: never
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          author_id: string
          created_at: string
          id: string
          message: string
          ride_id: string | null
          status: string
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          message: string
          ride_id?: string | null
          status?: string
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          message?: string
          ride_id?: string | null
          status?: string
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_logs: {
        Row: {
          actor_id: string
          created_at: string
          document_id: string
          id: number
        }
        Insert: {
          actor_id: string
          created_at?: string
          document_id: string
          id?: never
        }
        Update: {
          actor_id?: string
          created_at?: string
          document_id?: string
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "volunteer_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_needs: string | null
          avatar_path: string | null
          average_rating: number
          city: string | null
          created_at: string
          display_name: string | null
          district: string | null
          full_name: string
          has_vehicle: boolean
          id: string
          phone: string | null
          training_passed: boolean
          updated_at: string
          username: string
          volunteer_status: Database["public"]["Enums"]["review_status"]
        }
        Insert: {
          accessibility_needs?: string | null
          avatar_path?: string | null
          average_rating?: number
          city?: string | null
          created_at?: string
          display_name?: string | null
          district?: string | null
          full_name: string
          has_vehicle?: boolean
          id: string
          phone?: string | null
          training_passed?: boolean
          updated_at?: string
          username: string
          volunteer_status?: Database["public"]["Enums"]["review_status"]
        }
        Update: {
          accessibility_needs?: string | null
          avatar_path?: string | null
          average_rating?: number
          city?: string | null
          created_at?: string
          display_name?: string | null
          district?: string | null
          full_name?: string
          has_vehicle?: boolean
          id?: string
          phone?: string | null
          training_passed?: boolean
          updated_at?: string
          username?: string
          volunteer_status?: Database["public"]["Enums"]["review_status"]
        }
        Relationships: []
      }
      ride_private_details: {
        Row: {
          from_address: string
          note: string | null
          ride_id: string
          special_needs: string | null
          to_address: string
        }
        Insert: {
          from_address: string
          note?: string | null
          ride_id: string
          special_needs?: string | null
          to_address: string
        }
        Update: {
          from_address?: string
          note?: string | null
          ride_id?: string
          special_needs?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_private_details_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: true
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          companion: boolean
          created_at: string
          from_city: string
          from_district: string
          id: string
          passenger_completed: boolean
          passenger_id: string
          passenger_ok: boolean
          ride_date: string
          ride_time: string
          status: Database["public"]["Enums"]["ride_status"]
          to_city: string
          to_district: string
          updated_at: string
          volunteer_completed: boolean
          volunteer_id: string | null
          volunteer_ok: boolean
          wheelchair: boolean
        }
        Insert: {
          companion?: boolean
          created_at?: string
          from_city: string
          from_district: string
          id?: string
          passenger_completed?: boolean
          passenger_id: string
          passenger_ok?: boolean
          ride_date: string
          ride_time: string
          status?: Database["public"]["Enums"]["ride_status"]
          to_city: string
          to_district: string
          updated_at?: string
          volunteer_completed?: boolean
          volunteer_id?: string | null
          volunteer_ok?: boolean
          wheelchair?: boolean
        }
        Update: {
          companion?: boolean
          created_at?: string
          from_city?: string
          from_district?: string
          id?: string
          passenger_completed?: boolean
          passenger_id?: string
          passenger_ok?: boolean
          ride_date?: string
          ride_time?: string
          status?: Database["public"]["Enums"]["ride_status"]
          to_city?: string
          to_district?: string
          updated_at?: string
          volunteer_completed?: boolean
          volunteer_id?: string | null
          volunteer_ok?: boolean
          wheelchair?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_documents: {
        Row: {
          consent_at: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_kind"]
          id: string
          mime_type: string
          original_name: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          size_bytes: number
          status: Database["public"]["Enums"]["review_status"]
          storage_path: string
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          consent_at?: string | null
          created_at?: string
          document_type: Database["public"]["Enums"]["document_kind"]
          id?: string
          mime_type: string
          original_name: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes: number
          status?: Database["public"]["Enums"]["review_status"]
          storage_path: string
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          consent_at?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_kind"]
          id?: string
          mime_type?: string
          original_name?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number
          status?: Database["public"]["Enums"]["review_status"]
          storage_path?: string
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_documents_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_service_areas: {
        Row: {
          city: string
          created_at: string
          district: string
          id: string
          volunteer_id: string
        }
        Insert: {
          city: string
          created_at?: string
          district: string
          id?: string
          volunteer_id: string
        }
        Update: {
          city?: string
          created_at?: string
          district?: string
          id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_service_areas_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_ride: { Args: { p_request_id: string }; Returns: undefined }
      cancel_ride: { Args: { p_request_id: string }; Returns: undefined }
      complete_ride: { Args: { p_request_id: string }; Returns: undefined }
      confirm_ride: { Args: { p_request_id: string }; Returns: undefined }
      create_ride_request: {
        Args: {
          p_companion: boolean
          p_from_address: string
          p_from_city: string
          p_from_district: string
          p_note: string
          p_ride_date: string
          p_ride_time: string
          p_special_needs: string
          p_to_address: string
          p_to_city: string
          p_to_district: string
          p_wheelchair: boolean
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_open_rides: {
        Args: never
        Returns: {
          companion: boolean
          created_at: string
          from_city: string
          from_district: string
          id: string
          ride_date: string
          ride_time: string
          to_city: string
          to_district: string
          wheelchair: boolean
        }[]
      }
      log_document_access: {
        Args: { p_document_id: string }
        Returns: undefined
      }
      review_document: {
        Args: {
          p_document_id: string
          p_reason?: string
          p_status: Database["public"]["Enums"]["review_status"]
        }
        Returns: undefined
      }
      set_complaint_status: {
        Args: { p_complaint_id: string; p_status: string }
        Returns: undefined
      }
      set_volunteer_status: {
        Args: {
          p_status: Database["public"]["Enums"]["review_status"]
          p_volunteer_id: string
        }
        Returns: undefined
      }
      update_own_profile: {
        Args: {
          p_accessibility_needs: string
          p_avatar_path?: string
          p_city: string
          p_display_name: string
          p_district: string
          p_has_vehicle: boolean
          p_phone: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "yolcu" | "gonullu" | "yonetici" | "belge_denetci"
      document_kind:
        | "kimlik_on"
        | "kimlik_arka"
        | "ehliyet"
        | "ruhsat"
        | "adli_sicil"
      review_status: "beklemede" | "onaylandi" | "reddedildi"
      ride_status:
        | "olusturuldu"
        | "gonullu_bulundu"
        | "onaylandi"
        | "tamamlandi"
        | "iptal_edildi"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["yolcu", "gonullu", "yonetici", "belge_denetci"],
      document_kind: [
        "kimlik_on",
        "kimlik_arka",
        "ehliyet",
        "ruhsat",
        "adli_sicil",
      ],
      review_status: ["beklemede", "onaylandi", "reddedildi"],
      ride_status: [
        "olusturuldu",
        "gonullu_bulundu",
        "onaylandi",
        "tamamlandi",
        "iptal_edildi",
      ],
    },
  },
} as const
