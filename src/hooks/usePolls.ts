
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Poll {
  id: string;
  message_id?: string;
  creator_id: string;
  question: string;
  poll_type: 'single' | 'multiple' | 'quiz';
  is_anonymous: boolean;
  allows_multiple_answers: boolean;
  expires_at?: string;
  is_closed: boolean;
  correct_option_id?: string;
  created_at: string;
  options: PollOption[];
  votes?: PollVote[];
  user_voted?: boolean;
  user_votes?: string[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  option_order: number;
  vote_count: number;
  created_at: string;
  is_correct?: boolean;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_id: string;
  voted_at: string;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPolls = async () => {
    if (!user) return;

    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(*)
        `)
        .order('created_at', { ascending: false });

      if (pollsError) {
        console.error('Error fetching polls:', pollsError);
        return;
      }

      if (!pollsData) {
        setPolls([]);
        return;
      }

      // Get user votes for these polls
      const pollIds = pollsData.map(p => p.id);
      const { data: votesData } = await supabase
        .from('poll_votes')
        .select('*')
        .in('poll_id', pollIds)
        .eq('voter_id', user.id);

      const processedPolls = pollsData.map(poll => {
        const options = Array.isArray(poll.poll_options) ? poll.poll_options : [];
        const userVotes = votesData?.filter(v => v.poll_id === poll.id) || [];
        
        return {
          ...poll,
          poll_type: poll.poll_type as 'single' | 'multiple' | 'quiz',
          options: options.map(option => ({
            ...option,
            is_correct: option.id === poll.correct_option_id
          })),
          user_voted: userVotes.length > 0,
          user_votes: userVotes.map(v => v.option_id)
        };
      }) as Poll[];

      setPolls(processedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const createPoll = async (
    question: string,
    options: string[],
    settings: {
      pollType?: 'single' | 'multiple' | 'quiz';
      isAnonymous?: boolean;
      allowsMultipleAnswers?: boolean;
      expiresAt?: Date;
      correctOptionIndex?: number;
      messageId?: string;
    } = {}
  ) => {
    if (!user) return;

    try {
      // Create poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          creator_id: user.id,
          question,
          poll_type: settings.pollType || 'single',
          is_anonymous: settings.isAnonymous || false,
          allows_multiple_answers: settings.allowsMultipleAnswers || false,
          expires_at: settings.expiresAt?.toISOString(),
          message_id: settings.messageId,
          correct_option_id: null // Will be updated after creating options
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const optionsData = options.map((text, index) => ({
        poll_id: poll.id,
        text,
        option_order: index,
        vote_count: 0
      }));

      const { data: createdOptions, error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData)
        .select();

      if (optionsError) throw optionsError;

      // Update poll with correct option if it's a quiz
      if (settings.pollType === 'quiz' && typeof settings.correctOptionIndex === 'number' && createdOptions) {
        const correctOption = createdOptions[settings.correctOptionIndex];
        if (correctOption) {
          await supabase
            .from('polls')
            .update({ correct_option_id: correctOption.id })
            .eq('id', poll.id);
        }
      }

      await fetchPolls();

      toast({
        title: 'Sukces',
        description: 'Ankieta została utworzona'
      });

      return poll.id;
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
      // Check if user already voted
      const { data: existingVotes } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('voter_id', user.id);

      // Remove existing votes if any
      if (existingVotes && existingVotes.length > 0) {
        await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('voter_id', user.id);
      }

      // Add new votes
      const votes = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        voter_id: user.id
      }));

      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert(votes);

      if (voteError) throw voteError;

      // Update vote counts for each option
      for (const optionId of optionIds) {
        try {
          await supabase.rpc('increment_vote_count', { p_option_id: optionId });
        } catch (rpcError) {
          console.log('RPC function not available, updating directly');
          // Fallback: update vote count directly
          const { data: option } = await supabase
            .from('poll_options')
            .select('vote_count')
            .eq('id', optionId)
            .single();

          if (option) {
            await supabase
              .from('poll_options')
              .update({ vote_count: (option.vote_count || 0) + 1 })
              .eq('id', optionId);
          }
        }
      }

      await fetchPolls();

      toast({
        title: 'Sukces',
        description: 'Twój głos został zapisany'
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
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

      await fetchPolls();

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

  const deletePoll = async (pollId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)
        .eq('creator_id', user.id);

      if (error) throw error;

      setPolls(prev => prev.filter(poll => poll.id !== pollId));

      toast({
        title: 'Sukces',
        description: 'Ankieta została usunięta'
      });
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć ankiety',
        variant: 'destructive'
      });
    }
  };

  const getPollResults = async (pollId: string) => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          *,
          poll_options(*),
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
  }, [user]);

  return {
    polls,
    loading,
    createPoll,
    votePoll,
    closePoll,
    deletePoll,
    getPollResults,
    refetch: fetchPolls
  };
};
