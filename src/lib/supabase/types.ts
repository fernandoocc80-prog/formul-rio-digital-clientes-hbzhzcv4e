// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      form_drafts: {
        Row: {
          data: Json
          expires_at: string
          form_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          data: Json
          expires_at?: string
          form_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          expires_at?: string
          form_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_drafts_form_id_fkey'
            columns: ['form_id']
            isOneToOne: false
            referencedRelation: 'forms'
            referencedColumns: ['id']
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string
          data: Json
          form_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          data: Json
          form_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          data?: Json
          form_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'form_submissions_form_id_fkey'
            columns: ['form_id']
            isOneToOne: false
            referencedRelation: 'forms'
            referencedColumns: ['id']
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          schema: Json | null
          settings: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          schema?: Json | null
          settings?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          schema?: Json | null
          settings?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          created_at: string
          file_path: string
          id: string
          submission_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          submission_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'generated_documents_submission_id_fkey'
            columns: ['submission_id']
            isOneToOne: false
            referencedRelation: 'form_submissions'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string | null
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: form_drafts
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   form_id: uuid (not null)
//   data: jsonb (not null)
//   updated_at: timestamp with time zone (not null, default: now())
//   expires_at: timestamp with time zone (not null, default: (now() + '30 days'::interval))
// Table: form_submissions
//   id: uuid (not null, default: gen_random_uuid())
//   form_id: uuid (nullable)
//   data: jsonb (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: forms
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   schema: jsonb (nullable)
//   settings: jsonb (nullable)
//   user_id: uuid (nullable)
// Table: generated_documents
//   id: uuid (not null, default: gen_random_uuid())
//   submission_id: uuid (nullable)
//   file_path: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (not null)
//   role: text (nullable, default: 'admin'::text)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: form_drafts
//   FOREIGN KEY form_drafts_form_id_fkey: FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
//   PRIMARY KEY form_drafts_pkey: PRIMARY KEY (id)
//   FOREIGN KEY form_drafts_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE form_drafts_user_id_form_id_key: UNIQUE (user_id, form_id)
// Table: form_submissions
//   FOREIGN KEY form_submissions_form_id_fkey: FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL
//   PRIMARY KEY form_submissions_pkey: PRIMARY KEY (id)
// Table: forms
//   PRIMARY KEY forms_pkey: PRIMARY KEY (id)
//   FOREIGN KEY forms_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)
// Table: generated_documents
//   PRIMARY KEY generated_documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY generated_documents_submission_id_fkey: FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: form_drafts
//   Policy "Users can manage their own drafts" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: form_submissions
//   Policy "Anyone can insert submissions" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Auth users can delete submissions" (DELETE, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Auth users can update submissions" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Auth users can view submissions" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: forms
//   Policy "Auth users can delete forms" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
//   Policy "Public can read forms" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: generated_documents
//   Policy "Auth users can view documents" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
//   Policy "Public can insert generated documents" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: profiles
//   Policy "Auth users can update profiles" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
//   Policy "Auth users can view profiles" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 'admin');
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION verify_submission_exists()
//   CREATE OR REPLACE FUNCTION public.verify_submission_exists()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NOT EXISTS (SELECT 1 FROM form_submissions WHERE id = NEW.submission_id) THEN
//       RAISE EXCEPTION 'Submission ID % does not exist in form_submissions', NEW.submission_id;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: generated_documents
//   trg_verify_submission_exists: CREATE TRIGGER trg_verify_submission_exists BEFORE INSERT OR UPDATE ON public.generated_documents FOR EACH ROW EXECUTE FUNCTION verify_submission_exists()

// --- INDEXES ---
// Table: form_drafts
//   CREATE UNIQUE INDEX form_drafts_user_id_form_id_key ON public.form_drafts USING btree (user_id, form_id)
