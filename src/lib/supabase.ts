import { createClient } from "@supabase/supabase-js";

export type ContactMessage = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  subject: string;
  message: string;
  is_read: boolean;
};

export type SiteContactSettings = {
  id: boolean;
  email: string;
  phone: string;
  address: string;
  ad_email: string;
  support_message: string;
};

export type SiteSocialLink = {
  id: string;
  label: string;
  url: string;
  icon_key: string;
  is_active: boolean;
  order_index: number;
};

type Database = {
  public: {
    Tables: {
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, "id" | "created_at" | "is_read">;
        Update: Pick<ContactMessage, "is_read">;
        Relationships: [];
      };
      site_contact_settings: {
        Row: SiteContactSettings;
        Insert: SiteContactSettings;
        Update: Partial<Omit<SiteContactSettings, "id">>;
        Relationships: [];
      };
      site_social_links: {
        Row: SiteSocialLink;
        Insert: Omit<SiteSocialLink, "id">;
        Update: Partial<Omit<SiteSocialLink, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_site_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] || process.env.SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;
