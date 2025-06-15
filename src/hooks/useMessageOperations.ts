
import { useMessageFetcher } from './useMessageFetcher';
import { useMessageSender } from './useMessageSender';

export const useMessageOperations = (conversationId?: string) => {
  const { messages, setMessages, fetchMessages } = useMessageFetcher(conversationId);
  const { sendMessage } = useMessageSender(setMessages);

  return {
    messages,
    sendMessage,
    fetchMessages,
    setMessages
  };
};
