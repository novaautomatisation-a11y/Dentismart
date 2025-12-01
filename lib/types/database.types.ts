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
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          cabinet_id: string
          role: 'owner' | 'staff'
          created_at: string
        }
        Insert: {
          id: string
          cabinet_id: string
          role: 'owner' | 'staff'
          created_at?: string
        }
        Update: {
          id?: string
          cabinet_id?: string
          role?: 'owner' | 'staff'
          created_at?: string
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
