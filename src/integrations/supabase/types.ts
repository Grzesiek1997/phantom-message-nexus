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
      attachments: {
        Row: {
          created_at: string | null
          file_type: string
          file_url: string
          id: string
          message_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_type: string
          file_url: string
          id?: string
          message_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_auth_attempts: {
        Row: {
          attempt_time: string
          biometric_type: string
          id: string
          success: boolean
          user_id: string
        }
        Insert: {
          attempt_time?: string
          biometric_type: string
          id?: string
          success: boolean
          user_id: string
        }
        Update: {
          attempt_time?: string
          biometric_type?: string
          id?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      biometric_data: {
        Row: {
          biometric_type: string
          biometric_value: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          biometric_type: string
          biometric_value: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          biometric_type?: string
          biometric_value?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      biometric_settings: {
        Row: {
          id: string
          is_enabled: boolean
          last_updated: string
          user_id: string
        }
        Insert: {
          id?: string
          is_enabled?: boolean
          last_updated?: string
          user_id: string
        }
        Update: {
          id?: string
          is_enabled?: boolean
          last_updated?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          blocked_user_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          blocked_user_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      call_participants: {
        Row: {
          call_id: string | null
          connection_quality: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          user_id: string | null
          was_invited: boolean | null
        }
        Insert: {
          call_id?: string | null
          connection_quality?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id?: string | null
          was_invited?: boolean | null
        }
        Update: {
          call_id?: string | null
          connection_quality?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id?: string | null
          was_invited?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "call_participants_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          caller_id: string
          connected_at: string | null
          connection_type: string | null
          conversation_id: string | null
          duration_seconds: number | null
          end_reason: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          quality_rating: number | null
          started_at: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          caller_id: string
          connected_at?: string | null
          connection_type?: string | null
          conversation_id?: string | null
          duration_seconds?: number | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          quality_rating?: number | null
          started_at?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          caller_id?: string
          connected_at?: string | null
          connection_type?: string | null
          conversation_id?: string | null
          duration_seconds?: number | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          quality_rating?: number | null
          started_at?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: number | null
          id: number
          name: string
        }
        Insert: {
          country_id?: number | null
          id?: never
          name: string
        }
        Update: {
          country_id?: number | null
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_verifications: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          safety_number: string
          user1_id: string | null
          user2_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          safety_number: string
          user1_id?: string | null
          user2_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          safety_number?: string
          user1_id?: string | null
          user2_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          added_at: string | null
          contact_user_id: string
          created_at: string
          id: string
          is_blocked: boolean | null
          is_favorite: boolean | null
          nickname: string | null
          status: string
          user_id: string
          verified_safety_number: string | null
        }
        Insert: {
          added_at?: string | null
          contact_user_id: string
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          nickname?: string | null
          status?: string
          user_id: string
          verified_safety_number?: string | null
        }
        Update: {
          added_at?: string | null
          contact_user_id?: string
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          nickname?: string | null
          status?: string
          user_id?: string
          verified_safety_number?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          custom_notifications: Json | null
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          last_read_message_id: string | null
          muted_until: string | null
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          custom_notifications?: Json | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          last_read_message_id?: string | null
          muted_until?: string | null
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          custom_notifications?: Json | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          last_read_message_id?: string | null
          muted_until?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          disappearing_messages_ttl: number | null
          group_key: string | null
          id: string
          invite_link: string | null
          invite_link_enabled: boolean | null
          is_admin_only: boolean | null
          last_message_at: string | null
          member_count: number | null
          member_limit: number | null
          message_count: number | null
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          disappearing_messages_ttl?: number | null
          group_key?: string | null
          id?: string
          invite_link?: string | null
          invite_link_enabled?: boolean | null
          is_admin_only?: boolean | null
          last_message_at?: string | null
          member_count?: number | null
          member_limit?: number | null
          message_count?: number | null
          name?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          disappearing_messages_ttl?: number | null
          group_key?: string | null
          id?: string
          invite_link?: string | null
          invite_link_enabled?: boolean | null
          is_admin_only?: boolean | null
          last_message_at?: string | null
          member_count?: number | null
          member_limit?: number | null
          message_count?: number | null
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      decryption_failures: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          device_info: Json | null
          failure_type: string | null
          id: string
          ip_address: unknown | null
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          failure_type?: string | null
          id?: string
          ip_address?: unknown | null
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          failure_type?: string | null
          id?: string
          ip_address?: unknown | null
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decryption_failures_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      disappearing_messages_queue: {
        Row: {
          created_at: string | null
          delete_at: string
          id: string
          message_id: string | null
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          delete_at: string
          id?: string
          message_id?: string | null
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          delete_at?: string
          id?: string
          message_id?: string | null
          processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "disappearing_messages_queue_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
          status: string
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
          status?: string
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      group_chat_members: {
        Row: {
          group_chat_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          group_chat_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          group_chat_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_members_group_chat_id_fkey"
            columns: ["group_chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      key_exchange_sessions: {
        Row: {
          chain_key_receive: string
          chain_key_send: string
          created_at: string | null
          dh_ratchet_key: string
          id: string
          next_header_key: string
          previous_counter: number | null
          receive_counter: number | null
          root_key: string
          send_counter: number | null
          updated_at: string | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          chain_key_receive: string
          chain_key_send: string
          created_at?: string | null
          dh_ratchet_key: string
          id?: string
          next_header_key: string
          previous_counter?: number | null
          receive_counter?: number | null
          root_key: string
          send_counter?: number | null
          updated_at?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          chain_key_receive?: string
          chain_key_send?: string
          created_at?: string | null
          dh_ratchet_key?: string
          id?: string
          next_header_key?: string
          previous_counter?: number | null
          receive_counter?: number | null
          root_key?: string
          send_counter?: number | null
          updated_at?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          dimensions: Json | null
          duration: number | null
          encryption_key: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
          thumbnail_path: string | null
          uploaded_at: string
        }
        Insert: {
          dimensions?: Json | null
          duration?: number | null
          encryption_key?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
          thumbnail_path?: string | null
          uploaded_at?: string
        }
        Update: {
          dimensions?: Json | null
          duration?: number | null
          encryption_key?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
          thumbnail_path?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_message_attachments_message_id"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_delivery: {
        Row: {
          device_id: string | null
          id: string
          message_id: string | null
          status: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          device_id?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          device_id?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_delivery_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_delivery_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_edit_history: {
        Row: {
          edited_at: string
          edited_by: string
          id: string
          message_id: string
          previous_content: string
        }
        Insert: {
          edited_at?: string
          edited_by: string
          id?: string
          message_id: string
          previous_content: string
        }
        Update: {
          edited_at?: string
          edited_by?: string
          id?: string
          message_id?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_message_edit_history_message_id"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string | null
          reaction_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_message_read_status_message_id"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_status: {
        Row: {
          id: string
          message_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          group_chat_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          group_chat_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          group_chat_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_group_chat_id_fkey"
            columns: ["group_chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          auto_delete_after: number | null
          content: string
          content_encrypted: string | null
          content_hash: string | null
          conversation_id: string
          created_at: string
          deleted_for_users: string[] | null
          edit_history: Json | null
          expires_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          message_type: string
          reply_to_id: string | null
          sender_id: string
          server_timestamp: string | null
          thread_root_id: string | null
          updated_at: string
        }
        Insert: {
          auto_delete_after?: number | null
          content: string
          content_encrypted?: string | null
          content_hash?: string | null
          conversation_id: string
          created_at?: string
          deleted_for_users?: string[] | null
          edit_history?: Json | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string
          reply_to_id?: string | null
          sender_id: string
          server_timestamp?: string | null
          thread_root_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_delete_after?: number | null
          content?: string
          content_encrypted?: string | null
          content_hash?: string | null
          conversation_id?: string
          created_at?: string
          deleted_for_users?: string[] | null
          edit_history?: Json | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string
          reply_to_id?: string | null
          sender_id?: string
          server_timestamp?: string | null
          thread_root_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_root_id_fkey"
            columns: ["thread_root_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_tokens_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          message_id: string | null
          notification_type: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          message_id?: string | null
          notification_type?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          message_id?: string | null
          notification_type?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_actions: {
        Row: {
          action: string
          id: string
          target_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          target_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          target_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          backup_phrase_hash: string | null
          created_at: string
          disappearing_messages_ttl: number | null
          display_name: string | null
          id: string
          identity_key: string | null
          is_online: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          last_seen: string | null
          one_time_prekeys: string[] | null
          phone: string | null
          pin_hash: string | null
          prekey_signature: string | null
          premium_expires_at: string | null
          privacy_settings: Json | null
          signed_prekey: string | null
          status: string | null
          two_factor_secret: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          backup_phrase_hash?: string | null
          created_at?: string
          disappearing_messages_ttl?: number | null
          display_name?: string | null
          id: string
          identity_key?: string | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_seen?: string | null
          one_time_prekeys?: string[] | null
          phone?: string | null
          pin_hash?: string | null
          prekey_signature?: string | null
          premium_expires_at?: string | null
          privacy_settings?: Json | null
          signed_prekey?: string | null
          status?: string | null
          two_factor_secret?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          backup_phrase_hash?: string | null
          created_at?: string
          disappearing_messages_ttl?: number | null
          display_name?: string | null
          id?: string
          identity_key?: string | null
          is_online?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          last_seen?: string | null
          one_time_prekeys?: string[] | null
          phone?: string | null
          pin_hash?: string | null
          prekey_signature?: string | null
          premium_expires_at?: string | null
          privacy_settings?: Json | null
          signed_prekey?: string | null
          status?: string | null
          two_factor_secret?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string | null
          device_id: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      tabelaAdmin: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_typing_indicators_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          created_at: string | null
          device_id: string
          device_key: string
          device_name: string
          id: string
          is_primary: boolean | null
          last_active: string | null
          platform: string | null
          push_token: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          device_key: string
          device_name: string
          id?: string
          is_primary?: boolean | null
          last_active?: string | null
          platform?: string | null
          push_token?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          device_key?: string
          device_name?: string
          id?: string
          is_primary?: boolean | null
          last_active?: string | null
          platform?: string | null
          push_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_encryption_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_type: string
          public_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_type?: string
          public_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_type?: string
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          is_active: boolean
          last_activity: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          is_active?: boolean
          last_activity?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_status: {
        Row: {
          custom_status: string | null
          id: string
          last_seen: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          custom_status?: string | null
          id?: string
          last_seen?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          custom_status?: string | null
          id?: string
          last_seen?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          public_key: string | null
        }
        Insert: {
          id?: string
          public_key?: string | null
        }
        Update: {
          id?: string
          public_key?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      are_users_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      cleanup_disappearing_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_messages: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_group_chat: {
        Args: { group_name: string; user_id: string }
        Returns: string
      }
      delete_contact: {
        Args: { contact_id: string }
        Returns: undefined
      }
      delete_friend_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      generate_safety_number: {
        Args: { user1_uuid: string; user2_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: { check_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      login_user: {
        Args: { login_or_email: string; password: string }
        Returns: undefined
      }
      register_user: {
        Args:
          | Record<PropertyKey, never>
          | { username: string; password: string; display_name?: string }
        Returns: undefined
      }
      reject_friend_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      send_message: {
        Args: { conversation_id: string; sender_id: string; content: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
