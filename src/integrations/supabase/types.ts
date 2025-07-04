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
          attachment_type_id: number | null
          file_path: string | null
          id: string
          message_id: string | null
        }
        Insert: {
          attachment_type_id?: number | null
          file_path?: string | null
          id?: string
          message_id?: string | null
        }
        Update: {
          attachment_type_id?: number | null
          file_path?: string | null
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: number
          entity_type: string
          id: number
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: number
          entity_type: string
          id?: never
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: number
          entity_type?: string
          id?: never
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      biometric_auth_attempts: {
        Row: {
          attempted_at: string | null
          biometric_data_id: string | null
          id: string
          success: boolean | null
        }
        Insert: {
          attempted_at?: string | null
          biometric_data_id?: string | null
          id?: string
          success?: boolean | null
        }
        Update: {
          attempted_at?: string | null
          biometric_data_id?: string | null
          id?: string
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_auth_attempts_biometric_data_id_fkey"
            columns: ["biometric_data_id"]
            isOneToOne: false
            referencedRelation: "biometric_data"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_data: {
        Row: {
          data: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          data?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          data?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_settings: {
        Row: {
          id: string
          setting_key: string | null
          setting_value: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          setting_key?: string | null
          setting_value?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          setting_key?: string | null
          setting_value?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_blocked"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_blocker"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_commands: {
        Row: {
          bot_id: string | null
          command: string
          created_at: string | null
          description: string
          id: string
          scope: string | null
          usage_example: string | null
        }
        Insert: {
          bot_id?: string | null
          command: string
          created_at?: string | null
          description: string
          id?: string
          scope?: string | null
          usage_example?: string | null
        }
        Update: {
          bot_id?: string | null
          command?: string
          created_at?: string | null
          description?: string
          id?: string
          scope?: string | null
          usage_example?: string | null
        }
        Relationships: []
      }
      bot_interactions: {
        Row: {
          bot_id: string | null
          created_at: string | null
          id: string
          message: string | null
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_interactions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          id: string
          name: string | null
          owner_id: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bots_owner_id_fkey"
            columns: ["owner_id"]
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
        Relationships: []
      }
      channel_admins: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          channel_id: string | null
          id: string
          permissions: Json | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          channel_id?: string | null
          id?: string
          permissions?: Json | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          channel_id?: string | null
          id?: string
          permissions?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_admins_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_subscribers: {
        Row: {
          channel_id: string | null
          id: string
          is_premium_subscriber: boolean | null
          notifications_enabled: boolean | null
          premium_expires_at: string | null
          subscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          is_premium_subscriber?: boolean | null
          notifications_enabled?: boolean | null
          premium_expires_at?: string | null
          subscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          is_premium_subscriber?: boolean | null
          notifications_enabled?: boolean | null
          premium_expires_at?: string | null
          subscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_subscribers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          auto_delete_messages: boolean | null
          avatar_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_premium: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          message_ttl: number | null
          name: string
          owner_id: string
          subscriber_count: number | null
          subscription_price: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          auto_delete_messages?: boolean | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          message_ttl?: number | null
          name: string
          owner_id: string
          subscriber_count?: number | null
          subscription_price?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          auto_delete_messages?: boolean | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          message_ttl?: number | null
          name?: string
          owner_id?: string
          subscriber_count?: number | null
          subscription_price?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
        Relationships: [
          {
            foreignKeyName: "contacts_contact_user_id_fkey"
            columns: ["contact_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analytics: {
        Row: {
          active_members: number | null
          conversation_id: string | null
          created_at: string | null
          date: string
          id: string
          left_members: number | null
          media_messages: number | null
          new_members: number | null
          text_messages: number | null
          total_messages: number | null
          voice_messages: number | null
        }
        Insert: {
          active_members?: number | null
          conversation_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          left_members?: number | null
          media_messages?: number | null
          new_members?: number | null
          text_messages?: number | null
          total_messages?: number | null
          voice_messages?: number | null
        }
        Update: {
          active_members?: number | null
          conversation_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          left_members?: number | null
          media_messages?: number | null
          new_members?: number | null
          text_messages?: number | null
          total_messages?: number | null
          voice_messages?: number | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          is_admin: boolean | null
          nickname: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_admin?: boolean | null
          nickname?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_admin?: boolean | null
          nickname?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          is_group: boolean | null
          last_message_id: number | null
          message_count: number | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_group?: boolean | null
          last_message_id?: number | null
          message_count?: number | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_group?: boolean | null
          last_message_id?: number | null
          message_count?: number | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
      }
      feedback: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      friends: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      live_location_updates: {
        Row: {
          accuracy: number | null
          heading: number | null
          id: string
          latitude: number
          location_share_id: string | null
          longitude: number
          speed: number | null
          timestamp: string | null
        }
        Insert: {
          accuracy?: number | null
          heading?: number | null
          id?: string
          latitude: number
          location_share_id?: string | null
          longitude: number
          speed?: number | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number | null
          heading?: number | null
          id?: string
          latitude?: number
          location_share_id?: string | null
          longitude?: number
          speed?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_location_updates_location_share_id_fkey"
            columns: ["location_share_id"]
            isOneToOne: false
            referencedRelation: "location_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      location_shares: {
        Row: {
          accuracy: number | null
          altitude: number | null
          conversation_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_live: boolean | null
          latitude: number
          longitude: number
          shared_with: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_live?: boolean | null
          latitude: number
          longitude: number
          shared_with?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_live?: boolean | null
          latitude?: number
          longitude?: number
          shared_with?: string[] | null
          updated_at?: string | null
          user_id?: string | null
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
        Relationships: []
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
        Relationships: []
      }
      message_drafts: {
        Row: {
          attachments: Json | null
          content_encrypted: string
          conversation_id: string | null
          created_at: string | null
          id: string
          reply_to_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content_encrypted: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content_encrypted?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string | null
          reaction_type: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          reaction_type?: string | null
          user_id?: string | null
        }
        Update: {
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
            foreignKeyName: "message_read_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          user_id: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_message_status_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          content: string | null
          conversation_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          sender_id: string | null
          sent_at: string | null
          thread_root_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          thread_root_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          thread_root_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
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
        Relationships: []
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
        Relationships: []
      }
      participant_settings: {
        Row: {
          archive_conversation: boolean | null
          created_at: string | null
          id: string
          mute_notifications: boolean | null
          participant_id: string
          pin_conversation: boolean | null
          updated_at: string | null
        }
        Insert: {
          archive_conversation?: boolean | null
          created_at?: string | null
          id?: string
          mute_notifications?: boolean | null
          participant_id: string
          pin_conversation?: boolean | null
          updated_at?: string | null
        }
        Update: {
          archive_conversation?: boolean | null
          created_at?: string | null
          id?: string
          mute_notifications?: boolean | null
          participant_id?: string
          pin_conversation?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_participant"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "conversation_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_order: number
          poll_id: string | null
          text: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_order: number
          poll_id?: string | null
          text: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_order?: number
          poll_id?: string | null
          text?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          option_id: string | null
          poll_id: string | null
          voted_at: string | null
          voter_id: string | null
        }
        Insert: {
          id?: string
          option_id?: string | null
          poll_id?: string | null
          voted_at?: string | null
          voter_id?: string | null
        }
        Update: {
          id?: string
          option_id?: string | null
          poll_id?: string | null
          voted_at?: string | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allows_multiple_answers: boolean | null
          correct_option_id: string | null
          created_at: string | null
          creator_id: string
          expires_at: string | null
          id: string
          is_anonymous: boolean | null
          is_closed: boolean | null
          message_id: string | null
          poll_type: string | null
          question: string
        }
        Insert: {
          allows_multiple_answers?: boolean | null
          correct_option_id?: string | null
          created_at?: string | null
          creator_id: string
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_closed?: boolean | null
          message_id?: string | null
          poll_type?: string | null
          question: string
        }
        Update: {
          allows_multiple_answers?: boolean | null
          correct_option_id?: string | null
          created_at?: string | null
          creator_id?: string
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_closed?: boolean | null
          message_id?: string | null
          poll_type?: string | null
          question?: string
        }
        Relationships: []
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
          bio: string | null
          created_at: string
          disappearing_messages_ttl: number | null
          display_name: string | null
          email_verified: boolean | null
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
          role: string | null
          signed_prekey: string | null
          status: string | null
          two_factor_secret: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          backup_phrase_hash?: string | null
          bio?: string | null
          created_at?: string
          disappearing_messages_ttl?: number | null
          display_name?: string | null
          email_verified?: boolean | null
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
          role?: string | null
          signed_prekey?: string | null
          status?: string | null
          two_factor_secret?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          backup_phrase_hash?: string | null
          bio?: string | null
          created_at?: string
          disappearing_messages_ttl?: number | null
          display_name?: string | null
          email_verified?: boolean | null
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
          role?: string | null
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
      scheduled_messages: {
        Row: {
          attachments: Json | null
          content_encrypted: string
          conversation_id: string | null
          created_at: string | null
          id: string
          message_type: string | null
          scheduled_for: string
          sent_at: string | null
          sent_message_id: string | null
          status: string | null
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content_encrypted: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          scheduled_for: string
          sent_at?: string | null
          sent_message_id?: string | null
          status?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content_encrypted?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          scheduled_for?: string
          sent_at?: string | null
          sent_message_id?: string | null
          status?: string | null
          timezone?: string | null
          user_id?: string | null
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
        Relationships: []
      }
      sticker_packs: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          download_count: number | null
          id: string
          is_animated: boolean | null
          is_free: boolean | null
          is_official: boolean | null
          name: string
          price: number | null
          rating: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_animated?: boolean | null
          is_free?: boolean | null
          is_official?: boolean | null
          name: string
          price?: number | null
          rating?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_animated?: boolean | null
          is_free?: boolean | null
          is_official?: boolean | null
          name?: string
          price?: number | null
          rating?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stickers: {
        Row: {
          created_at: string | null
          emoji_tags: string[] | null
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          pack_id: string | null
          thumbnail_url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          emoji_tags?: string[] | null
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          pack_id?: string | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          emoji_tags?: string[] | null
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          pack_id?: string | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stickers_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "sticker_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      story_replies: {
        Row: {
          content_encrypted: string
          created_at: string | null
          id: string
          replier_id: string | null
          story_id: string | null
        }
        Insert: {
          content_encrypted: string
          created_at?: string | null
          id?: string
          replier_id?: string | null
          story_id?: string | null
        }
        Update: {
          content_encrypted?: string
          created_at?: string | null
          id?: string
          replier_id?: string | null
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_replies_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          story_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          story_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
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
      themes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          download_count: number | null
          id: string
          is_official: boolean | null
          is_premium: boolean | null
          name: string
          preview_url: string | null
          rating: number | null
          theme_data: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          download_count?: number | null
          id?: string
          is_official?: boolean | null
          is_premium?: boolean | null
          name: string
          preview_url?: string | null
          rating?: number | null
          theme_data: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          download_count?: number | null
          id?: string
          is_official?: boolean | null
          is_premium?: boolean | null
          name?: string
          preview_url?: string | null
          rating?: number | null
          theme_data?: Json
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
        Relationships: []
      }
      usage_analytics: {
        Row: {
          active_conversations: number | null
          calls_made: number | null
          calls_received: number | null
          created_at: string | null
          date: string
          features_used: Json | null
          id: string
          messages_received: number | null
          messages_sent: number | null
          stories_posted: number | null
          stories_viewed: number | null
          time_spent_minutes: number | null
          user_id: string | null
          voice_messages_sent: number | null
        }
        Insert: {
          active_conversations?: number | null
          calls_made?: number | null
          calls_received?: number | null
          created_at?: string | null
          date: string
          features_used?: Json | null
          id?: string
          messages_received?: number | null
          messages_sent?: number | null
          stories_posted?: number | null
          stories_viewed?: number | null
          time_spent_minutes?: number | null
          user_id?: string | null
          voice_messages_sent?: number | null
        }
        Update: {
          active_conversations?: number | null
          calls_made?: number | null
          calls_received?: number | null
          created_at?: string | null
          date?: string
          features_used?: Json | null
          id?: string
          messages_received?: number | null
          messages_sent?: number | null
          stories_posted?: number | null
          stories_viewed?: number | null
          time_spent_minutes?: number | null
          user_id?: string | null
          voice_messages_sent?: number | null
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: number
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: never
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: never
          reason?: string | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          device_info: string | null
          id: string
          last_used: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: string | null
          id?: string
          last_used?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: string | null
          id?: string
          last_used?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      user_presence: {
        Row: {
          last_active_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          last_active_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          last_active_at?: string | null
          status?: string
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
        Relationships: []
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
      user_sticker_packs: {
        Row: {
          id: string
          installed_at: string | null
          pack_id: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          installed_at?: string | null
          pack_id?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          installed_at?: string | null
          pack_id?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sticker_packs_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "sticker_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stories: {
        Row: {
          allow_reactions: boolean | null
          allow_replies: boolean | null
          allowed_viewers: string[] | null
          background_color: string | null
          blocked_viewers: string[] | null
          content_encrypted: string
          content_type: string | null
          created_at: string | null
          duration: number | null
          expires_at: string | null
          id: string
          media_thumbnail: string | null
          media_url: string | null
          user_id: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          allow_reactions?: boolean | null
          allow_replies?: boolean | null
          allowed_viewers?: string[] | null
          background_color?: string | null
          blocked_viewers?: string[] | null
          content_encrypted: string
          content_type?: string | null
          created_at?: string | null
          duration?: number | null
          expires_at?: string | null
          id?: string
          media_thumbnail?: string | null
          media_url?: string | null
          user_id?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          allow_reactions?: boolean | null
          allow_replies?: boolean | null
          allowed_viewers?: string[] | null
          background_color?: string | null
          blocked_viewers?: string[] | null
          content_encrypted?: string
          content_type?: string | null
          created_at?: string | null
          duration?: number | null
          expires_at?: string | null
          id?: string
          media_thumbnail?: string | null
          media_url?: string | null
          user_id?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      user_themes: {
        Row: {
          id: string
          installed_at: string | null
          is_active: boolean | null
          theme_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          theme_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          installed_at?: string | null
          is_active?: boolean | null
          theme_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_seen: string | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_seen?: string | null
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_seen?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      voice_messages: {
        Row: {
          created_at: string | null
          duration_seconds: number
          file_size: number
          file_url: string
          id: string
          is_transcribed: boolean | null
          message_id: string | null
          play_count: number | null
          transcript: string | null
          waveform_data: Json | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds: number
          file_size: number
          file_url: string
          id?: string
          is_transcribed?: boolean | null
          message_id?: string | null
          play_count?: number | null
          transcript?: string | null
          waveform_data?: Json | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number
          file_size?: number
          file_url?: string
          id?: string
          is_transcribed?: boolean | null
          message_id?: string | null
          play_count?: number | null
          transcript?: string | null
          waveform_data?: Json | null
        }
        Relationships: []
      }
      voice_playbacks: {
        Row: {
          id: string
          play_duration: number | null
          played_at: string | null
          user_id: string | null
          voice_message_id: string | null
        }
        Insert: {
          id?: string
          play_duration?: number | null
          played_at?: string | null
          user_id?: string | null
          voice_message_id?: string | null
        }
        Update: {
          id?: string
          play_duration?: number | null
          played_at?: string | null
          user_id?: string | null
          voice_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_playbacks_voice_message_id_fkey"
            columns: ["voice_message_id"]
            isOneToOne: false
            referencedRelation: "voice_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      wallpapers: {
        Row: {
          blur_level: number | null
          brightness: number | null
          conversation_id: string | null
          created_at: string | null
          id: string
          image_url: string
          user_id: string | null
        }
        Insert: {
          blur_level?: number | null
          brightness?: number | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          user_id?: string | null
        }
        Update: {
          blur_level?: number | null
          brightness?: number | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_blocked_summary: {
        Row: {
          blocked: string | null
          blocker: string | null
          created_at: string | null
        }
        Relationships: []
      }
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
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_group_chat: {
        Args: { group_name: string; user_id: string }
        Returns: string
      }
      create_group_conversation: {
        Args: {
          p_name: string
          p_description?: string
          p_avatar_url?: string
          p_member_ids?: string[]
        }
        Returns: number
      }
      decrement_subscriber_count: {
        Args: { p_channel_id: string }
        Returns: undefined
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
      get_or_create_dm_conversation: {
        Args: { other_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { check_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      increment_story_view_count: {
        Args: { p_story_id: string }
        Returns: undefined
      }
      increment_subscriber_count: {
        Args: { p_channel_id: string }
        Returns: undefined
      }
      increment_vote_count: {
        Args: { p_option_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { conversation_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_member_of: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      login_user: {
        Args: { login_or_email: string; password: string }
        Returns: undefined
      }
      mark_conversation_as_read: {
        Args: { p_conversation_id: number }
        Returns: undefined
      }
      process_scheduled_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      save_message_draft: {
        Args: { p_conversation_id: number; p_content: string }
        Returns: undefined
      }
      send_message: {
        Args:
          | { conversation_id: string; sender_id: string; content: string }
          | {
              p_conversation_id: number
              p_content: string
              p_reply_to_id?: number
            }
        Returns: undefined
      }
      update_user_presence: {
        Args: { p_status: string }
        Returns: undefined
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
