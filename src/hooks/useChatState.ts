
import { useState, useEffect } from 'react';

export const useChatState = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    selectedConversationId,
    setSelectedConversationId,
    messageInput,
    setMessageInput,
    showContactSearch,
    setShowContactSearch,
    showAIAssistant,
    setShowAIAssistant,
    showGroupManagement,
    setShowGroupManagement,
    showNotifications,
    setShowNotifications,
    showSearchOverlay,
    setShowSearchOverlay,
    searchQuery,
    setSearchQuery,
    isMobile,
    showConversationList,
    setShowConversationList,
    replyingTo,
    setReplyingTo
  };
};
