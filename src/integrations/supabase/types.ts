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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          agendado_para: string
          concluido: boolean
          created_at: string
          id: string
          observacao: string | null
          post_id: string
          rede: string
          user_id: string
        }
        Insert: {
          agendado_para: string
          concluido?: boolean
          created_at?: string
          id?: string
          observacao?: string | null
          post_id: string
          rede?: string
          user_id: string
        }
        Update: {
          agendado_para?: string
          concluido?: boolean
          created_at?: string
          id?: string
          observacao?: string | null
          post_id?: string
          rede?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_gerados"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          mensagem: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mensagem?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          created_at: string
          email: string
          evento: string | null
          id: string
          order_id: string | null
          payload: Json | null
          plano_id: string | null
          status: string
          user_id: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          email: string
          evento?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          plano_id?: string | null
          status: string
          user_id?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          evento?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          plano_id?: string | null
          status?: string
          user_id?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      plan_checkouts: {
        Row: {
          checkout_url: string
          plano_id: string
          produto_id: string | null
          updated_at: string
        }
        Insert: {
          checkout_url: string
          plano_id: string
          produto_id?: string | null
          updated_at?: string
        }
        Update: {
          checkout_url?: string
          plano_id?: string
          produto_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      posts_gerados: {
        Row: {
          created_at: string
          favorito: boolean
          formato: string
          hashtags: string | null
          id: string
          imagem_url: string | null
          legenda: string
          nicho: string
          palavras_chave: string | null
          prompt_imagem: string | null
          titulo_curto: string | null
          tom_de_voz: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          favorito?: boolean
          formato?: string
          hashtags?: string | null
          id?: string
          imagem_url?: string | null
          legenda: string
          nicho: string
          palavras_chave?: string | null
          prompt_imagem?: string | null
          titulo_curto?: string | null
          tom_de_voz?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          favorito?: boolean
          formato?: string
          hashtags?: string | null
          id?: string
          imagem_url?: string | null
          legenda?: string
          nicho?: string
          palavras_chave?: string | null
          prompt_imagem?: string | null
          titulo_curto?: string | null
          tom_de_voz?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          logo_opacidade: number
          logo_posicao: string
          logo_tamanho: number
          logo_url: string | null
          nome: string | null
          nome_negocio: string | null
          telefone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          logo_opacidade?: number
          logo_posicao?: string
          logo_tamanho?: number
          logo_url?: string | null
          nome?: string | null
          nome_negocio?: string | null
          telefone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_opacidade?: number
          logo_posicao?: string
          logo_tamanho?: number
          logo_url?: string | null
          nome?: string | null
          nome_negocio?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          plano_ativo: string | null
          status: string
          trial_days: number
          trial_started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          plano_ativo?: string | null
          status?: string
          trial_days?: number
          trial_started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          plano_ativo?: string | null
          status?: string
          trial_days?: number
          trial_started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "cliente" | "admin"
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
      app_role: ["cliente", "admin"],
    },
  },
} as const
