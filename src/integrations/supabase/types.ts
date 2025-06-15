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
        Relationships: [
          {
            foreignKeyName: "bot_commands_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_interactions: {
        Row: {
          bot_id: string | null
          command: string | null
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          input_text: string | null
          response_text: string | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          command?: string | null
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_text?: string | null
          response_text?: string | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          command?: string | null
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_text?: string | null
          response_text?: string | null
          success?: boolean | null
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
            foreignKeyName: "bot_interactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          active_chats: number | null
          api_token: string | null
          avatar_url: string | null
          can_join_groups: boolean | null
          can_read_all_messages: boolean | null
          created_at: string | null
          description: string | null
          id: string
          inline_mode: boolean | null
          is_verified: boolean | null
          name: string
          owner_id: string
          total_interactions: number | null
          updated_at: string | null
          username: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          active_chats?: number | null
          api_token?: string | null
          avatar_url?: string | null
          can_join_groups?: boolean | null
          can_read_all_messages?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          inline_mode?: boolean | null
          is_verified?: boolean | null
          name: string
          owner_id: string
          total_interactions?: number | null
          updated_at?: string | null
          username: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          active_chats?: number | null
          api_token?: string | null
          avatar_url?: string | null
          can_join_groups?: boolean | null
          can_read_all_messages?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          inline_mode?: boolean | null
          is_verified?: boolean | null
          name?: string
          owner_id?: string
          total_interactions?: number | null
          updated_at?: string | null
          username?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "location_shares_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "message_attachments_message_id_fkey"
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
        Relationships: [
          {
            foreignKeyName: "message_drafts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_drafts_reply_to_id_fkey"
            columns: ["reply_to_id"]
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
          {
            foreignKeyName: "message_read_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
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
        Relationships: [
          {
            foreignKeyName: "polls_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_sent_message_id_fkey"
            columns: ["sent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "voice_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "wallpapers_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
