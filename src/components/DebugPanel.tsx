import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';

const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { receivedRequests, sentRequests } = useFriendRequests();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md z-50">
      <h3 className="font-bold mb-2">🐛 Debug Panel</h3>
      
      <div className="text-xs space-y-1">
        <div>
          <strong>User:</strong> {user?.id ? `${user.id.slice(0, 8)}...` : 'Not logged in'}
        </div>
        <div>
          <strong>Contacts:</strong> {contacts.length}
        </div>
        <div>
          <strong>Received Requests:</strong> {receivedRequests.length}
        </div>
        <div>
          <strong>Sent Requests:</strong> {sentRequests.length}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;