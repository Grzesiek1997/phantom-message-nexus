
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  Verified, 
  Crown,
  Settings,
  Plus
} from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';

interface ChannelsListProps {
  className?: string;
}

const ChannelsList: React.FC<ChannelsListProps> = ({ className }) => {
  const { 
    channels, 
    subscribedChannels, 
    ownedChannels, 
    loading,
    subscribeToChannel,
    unsubscribeFromChannel,
    searchChannels
  } = useChannels();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'subscribed' | 'discover' | 'owned'>('subscribed');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchChannels(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <Card className={`glass border-white/20 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const renderChannel = (channel: any, isSubscribed = false) => (
    <div key={channel.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarImage src={channel.avatar_url} />
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          {channel.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-white truncate">{channel.name}</h3>
          {channel.is_verified && (
            <Verified className="w-4 h-4 text-blue-500" />
          )}
          {channel.is_premium && (
            <Crown className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        
        {channel.username && (
          <p className="text-gray-400 text-sm">@{channel.username}</p>
        )}
        
        <p className="text-gray-300 text-sm truncate mt-1">
          {channel.description}
        </p>
        
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-1 text-gray-400 text-xs">
            <Users className="w-3 h-3" />
            <span>{channel.subscriber_count}</span>
          </div>
          
          {channel.category && (
            <Badge variant="secondary" className="text-xs">
              {channel.category}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        {isSubscribed ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => unsubscribeFromChannel(channel.id)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Anuluj subskrypcję
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => subscribeToChannel(channel.id)}
            className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
          >
            Subskrybuj
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Card className="glass border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Kanały</h2>
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Utwórz kanał
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Szukaj kanałów..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4 bg-white/10 rounded-lg p-1">
            {[
              { key: 'subscribed', label: 'Subskrybowane' },
              { key: 'discover', label: 'Odkrywaj' },
              { key: 'owned', label: 'Twoje kanały' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {searchQuery && searchResults.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Wyniki wyszukiwania ({searchResults.length})
              </h3>
              {searchResults.map(channel => renderChannel(channel))}
            </div>
          ) : activeTab === 'subscribed' ? (
            subscribedChannels.length > 0 ? (
              <div className="space-y-2">
                {subscribedChannels.map(channel => renderChannel(channel, true))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nie subskrybujesz żadnych kanałów</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                >
                  Odkrywaj kanały
                </Button>
              </div>
            )
          ) : activeTab === 'discover' ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Popularne kanały
              </h3>
              {channels.map(channel => renderChannel(channel))}
            </div>
          ) : activeTab === 'owned' ? (
            ownedChannels.length > 0 ? (
              <div className="space-y-2">
                {ownedChannels.map(channel => (
                  <div key={channel.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={channel.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {channel.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white truncate">{channel.name}</h3>
                        {channel.is_verified && (
                          <Verified className="w-4 h-4 text-blue-500" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Właściciel
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-gray-400 text-xs">
                          <Users className="w-3 h-3" />
                          <span>{channel.subscriber_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nie masz jeszcze żadnych kanałów</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Utwórz pierwszy kanał
                </Button>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChannelsList;
