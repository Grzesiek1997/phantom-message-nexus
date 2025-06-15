
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  option_order: number;
  vote_count: number;
  created_at: string;
}

export interface Poll {
  id: string;
  message_id: string;
  creator_id: string;
  question: string;
  poll_type: 'single' | 'multiple' | 'quiz';
  is_anonymous: boolean;
  allows_multiple_answers: boolean;
  correct_option_id?: string;
  expires_at?: string;
  is_closed: boolean;
  created_at: string;
  options: PollOption[];
  user_votes?: string[];
  total_votes: number;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPolls = async (conversationId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*),
          votes:poll_votes(option_id, voter_id)
        `);

      if (conversationId) {
        // Get message IDs from the conversation first
        const { data: messageIds } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conversationId);
        
        if (messageIds && messageIds.length > 0) {
          const ids = messageIds.map(m => m.id);
          query = query.in('message_id', ids);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const processedPolls = (data || []).map(poll => {
        const options = poll.options || [];
        const votes = poll.votes || [];
        const userVotes = votes
          .filter((vote: any) => vote.voter_id === user.id)
          .map((vote: any) => vote.option_id);
        
        const totalVotes = votes.length;

        return {
          ...poll,
          poll_type: (poll.poll_type as 'single' | 'multiple' | 'quiz') || 'single',
          options,
          user_votes: userVotes,
          total_votes: totalVotes
        };
      }) as Poll[];

      setPolls(processedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (
    messageId: string,
    question: string,
    options: string[],
    pollType: 'single' | 'multiple' | 'quiz' = 'single',
    settings: {
      isAnonymous?: boolean;
      allowsMultipleAnswers?: boolean;
      correctOptionIndex?: number;
      expiresAt?: string;
    } = {}
  ) => {
    if (!user) return;

    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          message_id: messageId,
          creator_id: user.id,
          question,
          poll_type: pollType,
          is_anonymous: settings.isAnonymous || false,
          allows_multiple_answers: settings.allowsMultipleAnswers || false,
          expires_at: settings.expiresAt,
          correct_option_id: settings.correctOptionIndex !== undefined 
            ? undefined
            : undefined
        })
        .select()
        .single();

      if (pollError) throw pollError;

      const optionsData = options.map((text, index) => ({
        poll_id: pollData.id,
        text,
        option_order: index
      }));

      const { data: createdOptions, error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData)
        .select();

      if (optionsError) throw optionsError;

      if (pollType === 'quiz' && settings.correctOptionIndex !== undefined) {
        const correctOption = createdOptions[settings.correctOptionIndex];
        if (correctOption) {
          await supabase
            .from('polls')
            .update({ correct_option_id: correctOption.id })
            .eq('id', pollData.id);
        }
      }

      const newPoll: Poll = {
        ...pollData,
        poll_type: pollData.poll_type as 'single' | 'multiple' | 'quiz',
        options: createdOptions,
        user_votes: [],
        total_votes: 0
      };

      setPolls(prev => [newPoll, ...prev]);

      toast({
        title: 'Sukces',
        description: 'Ankieta została utworzona'
      });

      return newPoll;
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć ankiety',
        variant: 'destructive'
      });
    }
  };

  const votePoll = async (pollId: string, optionIds: string[]) => {
    if (!user) return;

    try {
      const poll = polls.find(p => p.id === pollId);
      if (!poll) return;

      if (poll.is_closed || (poll.expires_at && new Date(poll.expires_at) < new Date())) {
        toast({
          title: 'Błąd',
          description: 'Ta ankieta została zamknięta',
          variant: 'destructive'
        });
        return;
      }

      if (!poll.allows_multiple_answers) {
        await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('voter_id', user.id);
      }

      const votesData = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        voter_id: user.id
      }));

      const { error } = await supabase
        .from('poll_votes')
        .insert(votesData);

      if (error) throw error;

      // Update vote counts directly
      for (const optionId of optionIds) {
        const currentOption = poll.options.find(opt => opt.id === optionId);
        if (currentOption) {
          await supabase
            .from('poll_options')
            .update({ vote_count: (currentOption.vote_count || 0) + 1 })
            .eq('id', optionId);
        }
      }

      await fetchPolls();

      toast({
        title: 'Sukces',
        description: 'Twój głos został zapisany'
      });
    } catch (error) {
      console.error('Error voting in poll:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zagłosować',
        variant: 'destructive'
      });
    }
  };

  const closePoll = async (pollId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('polls')
        .update({ is_closed: true })
        .eq('id', pollId)
        .eq('creator_id', user.id);

      if (error) throw error;

      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? { ...poll, is_closed: true } : poll
      ));

      toast({
        title: 'Sukces',
        description: 'Ankieta została zamknięta'
      });
    } catch (error) {
      console.error('Error closing poll:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zamknąć ankiety',
        variant: 'destructive'
      });
    }
  };

  const getPollResults = async (pollId: string) => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          option_id,
          voter:profiles!poll_votes_voter_id_fkey(username, display_name, avatar_url)
        `)
        .eq('poll_id', pollId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching poll results:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPolls();

    const channel = supabase
      .channel('polls-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'poll_votes' },
        () => fetchPolls()
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'polls' },
        () => fetchPolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    polls,
    loading,
    createPoll,
    votePoll,
    closePoll,
    getPollResults,
    refetch: fetchPolls
  };
};
