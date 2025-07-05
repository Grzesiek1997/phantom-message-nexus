
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, MoreVertical, UserCheck, Clock, X, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserStatusIndicator from '../UserStatusIndicator';
import { useUserStatus } from '@/hooks/useUserStatus';
import type { Contact } from '@/hooks/useContacts';
import type { FriendRequest } from '@/hooks/useFriendRequests';

interface ContactsMainContentProps {
  activeTab: 'friends' | 'received' | 'sent' | 'groups';
  searchQuery: string;
  filteredContacts: Contact[];
  filteredReceivedRequests: FriendRequest[];
  filteredSentRequests: FriendRequest[];
  onTabChange: (tab: 'friends' | 'received' | 'sent' | 'groups') => void;
  onSearchChange: (query: string) => void;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

const ContactsMainContent: React.FC<ContactsMainContentProps> = ({
  activeTab,
  searchQuery,
  filteredContacts,
  filteredReceivedRequests,
  filteredSentRequests,
  onTabChange,
  onSearchChange,
  onSelectContact,
  onDeleteContact,
  onAcceptRequest,
  onRejectRequest,
  onDeleteRequest
}) => {
  const { userStatuses } = useUserStatus();

  const getAvatarFallback = (displayName?: string, username?: string) => {
    return displayName?.charAt(0) || username?.charAt(0) || '?';
  };

  const ContactItem = ({ contact }: { contact: Contact }) => {
    const userStatus = userStatuses[contact.contact_user_id];
    
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={contact.profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {getAvatarFallback(contact.profile.display_name, contact.profile.username)}
              </AvatarFallback>
            </Avatar>
            {userStatus && (
              <div className="absolute -bottom-1 -right-1">
                <UserStatusIndicator status={userStatus} size="sm" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-white">
                {contact.profile.display_name || contact.profile.username}
              </h3>
              {contact.can_chat && (
                <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Znajomy
                </Badge>
              )}
            </div>
            {contact.profile.display_name && (
              <p className="text-sm text-gray-400">@{contact.profile.username}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {contact.can_chat && (
            <Button
              size="sm"
              onClick={() => onSelectContact(contact.contact_user_id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem 
                className="text-red-400 hover:bg-gray-700 hover:text-red-300"
                onClick={() => onDeleteContact(contact.id)}
              >
                Usuń kontakt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const ReceivedRequestItem = ({ request }: { request: FriendRequest }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={request.sender_profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            {getAvatarFallback(request.sender_profile?.display_name, request.sender_profile?.username)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-medium text-white">
            {request.sender_profile?.display_name || request.sender_profile?.username}
          </h3>
          {request.sender_profile?.display_name && (
            <p className="text-sm text-gray-400">@{request.sender_profile.username}</p>
          )}
          <p className="text-xs text-gray-500">
            {new Date(request.created_at).toLocaleDateString('pl-PL')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={() => onAcceptRequest(request.id)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRejectRequest(request.id)}
          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const SentRequestItem = ({ request }: { request: FriendRequest }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={request.receiver_profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            {getAvatarFallback(request.receiver_profile?.display_name, request.receiver_profile?.username)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-medium text-white">
            {request.receiver_profile?.display_name || request.receiver_profile?.username}
          </h3>
          {request.receiver_profile?.display_name && (
            <p className="text-sm text-gray-400">@{request.receiver_profile.username}</p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={
              request.status === 'pending' ? 'secondary' : 
              request.status === 'accepted' ? 'default' : 'destructive'
            } className="text-xs">
              {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {request.status === 'pending' ? 'Oczekuje' : 
               request.status === 'accepted' ? 'Zaakceptowane' : 'Odrzucone'}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(request.created_at).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
      </div>
      
      {request.status === 'pending' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDeleteRequest(request.id)}
          className="border-gray-600 text-gray-400 hover:bg-gray-700"
        >
          Anuluj
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex-1 p-6">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Szukaj kontaktów..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="friends" className="text-white data-[state=active]:bg-blue-600">
            Znajomi ({filteredContacts.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="text-white data-[state=active]:bg-blue-600">
            Otrzymane ({filteredReceivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-white data-[state=active]:bg-blue-600">
            Wysłane ({filteredSentRequests.length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-white data-[state=active]:bg-blue-600">
            Grupy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-3 mt-6">
          {filteredContacts.map((contact) => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </TabsContent>

        <TabsContent value="received" className="space-y-3 mt-6">
          {filteredReceivedRequests.filter(req => req.status === 'pending').map((request) => (
            <ReceivedRequestItem key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3 mt-6">
          {filteredSentRequests.map((request) => (
            <SentRequestItem key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-3 mt-6">
          <div className="text-center text-gray-400 py-8">
            Funkcja grup będzie dostępna wkrótce
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactsMainContent;
