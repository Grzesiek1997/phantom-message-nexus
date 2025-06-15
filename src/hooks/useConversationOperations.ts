
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useConversationOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!user) return;

    try {
      console.log('Creating conversation with participants:', participantIds);

      // For direct conversations, check if one already exists
      if (type === 'direct' && participantIds.length === 1) {
        const otherUserId = participantIds[0];
        
        // Check if direct conversation already exists
        const { data: existingParticipants, error: checkError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, conversations!inner(type)')
          .in('user_id', [user.id, otherUserId]);

        if (checkError) {
          console.error('Error checking existing conversations:', checkError);
        } else if (existingParticipants) {
          // Find conversations that have both users and are direct
          const conversationCounts = existingParticipants.reduce((acc, p) => {
            if (p.conversations?.type === 'direct') {
              acc[p.conversation_id] = (acc[p.conversation_id] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          const existingConversationId = Object.keys(conversationCounts).find(
            id => conversationCounts[id] === 2
          );

          if (existingConversationId) {
            console.log('Direct conversation already exists:', existingConversationId);
            return existingConversationId;
          }
        }
      }

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          type,
          name,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        toast({
          title: 'Błąd tworzenia konwersacji',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      console.log('Conversation created:', conversation);

      // Add participants
      const participants = [user.id, ...participantIds].map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantError) {
        console.error('Error adding participants:', participantError);
        
        // If constraint violation (conversation already exists), just return the existing one
        if (participantError.code === '23505') {
          console.log('Conversation participants already exist');
          return conversation.id;
        }
        
        toast({
          title: 'Błąd dodawania uczestników',
          description: participantError.message,
          variant: 'destructive'
        });
        throw participantError;
      }

      console.log('Participants added successfully');
      return conversation.id;
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
  };

  return {
    createConversation
  };
};
