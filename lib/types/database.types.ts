// lib/types/database.types.ts
/**
 * Types TypeScript générés à partir du schema Supabase
 * Correspond au schema_sql fourni (cabinets, profiles, dentistes, patients, rendez_vous, messages)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cabinets: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          logo_url: string | null
          primary_color: string
          default_locale: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          primary_color?: string
          default_locale?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          primary_color?: string
          default_locale?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          cabinet_id: string
          role: 'owner' | 'dentist' | 'assistant'
          full_name: string | null
          avatar_url: string | null
          locale: string
          timezone: string
          ui_preferences: Json
          created_at: string
        }
        Insert: {
          id: string
          cabinet_id: string
          role: 'owner' | 'dentist' | 'assistant'
          full_name?: string | null
          avatar_url?: string | null
          locale?: string
          timezone?: string
          ui_preferences?: Json
          created_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          role?: 'owner' | 'dentist' | 'assistant'
          full_name?: string | null
          avatar_url?: string | null
          locale?: string
          timezone?: string
          ui_preferences?: Json
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          cabinet_id: string
          created_by: string
          name: string
          type: 'reactivation' | 'last_minute' | 'reminder' | 'review'
          channel: 'sms' | 'whatsapp' | 'email'
          message_template: string
          status: 'draft' | 'running' | 'completed' | 'cancelled'
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          cabinet_id: string
          created_by: string
          name: string
          type: 'reactivation' | 'last_minute' | 'reminder' | 'review'
          channel: 'sms' | 'whatsapp' | 'email'
          message_template: string
          status?: 'draft' | 'running' | 'completed' | 'cancelled'
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          cabinet_id?: string
          created_by?: string
          name?: string
          type?: 'reactivation' | 'last_minute' | 'reminder' | 'review'
          channel?: 'sms' | 'whatsapp' | 'email'
          message_template?: string
          status?: 'draft' | 'running' | 'completed' | 'cancelled'
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
      }
      campaign_recipients: {
        Row: {
          id: string
          campaign_id: string
          cabinet_id: string
          patient_id: string
          rendez_vous_id: string | null
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'responded'
          last_status_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          cabinet_id: string
          patient_id: string
          rendez_vous_id?: string | null
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'responded'
          last_status_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          cabinet_id?: string
          patient_id?: string
          rendez_vous_id?: string | null
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'responded'
          last_status_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          cabinet_id: string
          patient_id: string
          preferred_days: string[] | null
          preferred_times: string[] | null
          priority: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          patient_id: string
          preferred_days?: string[] | null
          preferred_times?: string[] | null
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          patient_id?: string
          preferred_days?: string[] | null
          preferred_times?: string[] | null
          priority?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      copilot_queries: {
        Row: {
          id: string
          cabinet_id: string
          user_id: string
          query_text: string
          response_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          user_id: string
          query_text: string
          response_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          user_id?: string
          query_text?: string
          response_summary?: string | null
          created_at?: string
        }
      }
      patient_scores: {
        Row: {
          id: string
          cabinet_id: string
          patient_id: string
          risk_score: number | null
          churn_score: number | null
          last_computed_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          patient_id: string
          risk_score?: number | null
          churn_score?: number | null
          last_computed_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          patient_id?: string
          risk_score?: number | null
          churn_score?: number | null
          last_computed_at?: string
        }
      }
      dentistes: {
        Row: {
          id: string
          cabinet_id: string
          full_name: string
          speciality: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          full_name: string
          speciality?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          full_name?: string
          speciality?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          cabinet_id: string
          dentiste_id: string | null
          first_name: string
          last_name: string
          phone: string
          email: string | null
          language: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          dentiste_id?: string | null
          first_name: string
          last_name: string
          phone: string
          email?: string | null
          language?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          dentiste_id?: string | null
          first_name?: string
          last_name?: string
          phone?: string
          email?: string | null
          language?: string | null
          created_at?: string
        }
      }
      rendez_vous: {
        Row: {
          id: string
          cabinet_id: string
          dentiste_id: string
          patient_id: string
          starts_at: string
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          dentiste_id: string
          patient_id: string
          starts_at: string
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          dentiste_id?: string
          patient_id?: string
          starts_at?: string
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          cabinet_id: string
          patient_id: string | null
          rendez_vous_id: string | null
          channel: 'sms' | 'whatsapp'
          type: 'reminder' | 'review_request' | 'other'
          direction: 'outbound' | 'inbound'
          body: string
          status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received'
          provider_message_id: string | null
          sent_at: string | null
          received_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cabinet_id: string
          patient_id?: string | null
          rendez_vous_id?: string | null
          channel: 'sms' | 'whatsapp'
          type: 'reminder' | 'review_request' | 'other'
          direction: 'outbound' | 'inbound'
          body: string
          status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received'
          provider_message_id?: string | null
          sent_at?: string | null
          received_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          patient_id?: string | null
          rendez_vous_id?: string | null
          channel?: 'sms' | 'whatsapp'
          type?: 'reminder' | 'review_request' | 'other'
          direction?: 'outbound' | 'inbound'
          body?: string
          status?: 'queued' | 'sent' | 'delivered' | 'failed' | 'received'
          provider_message_id?: string | null
          sent_at?: string | null
          received_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
