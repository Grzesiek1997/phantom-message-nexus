import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, X, Heart, MessageCircle, Eye } from 'lucide-react';
import { useStories } from '@/hooks/useStories';

interface StoriesViewerProps {
  className?: string;
}

const StoriesViewer: React.FC<StoriesViewerProps> = ({ className }) => {
  const { stories, userStories, loading, viewStory, createStory, deleteStory } = useStories();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStoryView = async (story: any) => {
    setSelectedStory(story);
    if (!story.viewed_by_user) {
      await viewStory(story.id);
    }
  };

  const closeStoryViewer = () => {
    setSelectedStory(null);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <Card className={`glass border-white/20 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-4"></div>
          <div className="flex space-x-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-white/20 rounded-full"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Stories Bar */}
      <Card className="glass border-white/20 p-4 mb-4">
        <h3 className="text-white font-semibold mb-4">Historie</h3>
        <div className="flex space-x-4 overflow-x-auto">
          {/* User's Stories */}
          <div className="flex-shrink-0 text-center">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-blue-500">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  You
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  // Open story creation modal
                  console.log('Create story');
                }}
              >
                +
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Twoja historia</p>
            {userStories.length > 0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                {userStories.length}
              </Badge>
            )}
          </div>

          {/* Other Users' Stories */}
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex-shrink-0 text-center cursor-pointer"
              onClick={() => handleStoryView(story)}
            >
              <Avatar className={`w-16 h-16 border-2 ${
                story.viewed_by_user ? 'border-gray-500' : 'border-gradient-to-r from-pink-500 to-yellow-500'
              }`}>
                <AvatarImage src={story.author?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
                  {story.author?.display_name?.charAt(0) || story.author?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-gray-400 mt-2 max-w-[64px] truncate">
                {story.author?.display_name || story.author?.username}
              </p>
              <div className="flex items-center justify-center mt-1">
                <Eye className="w-3 h-3 text-gray-500 mr-1" />
                <span className="text-xs text-gray-500">{story.view_count}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-md h-full max-h-[600px] bg-black rounded-lg overflow-hidden">
            {/* Story Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedStory.author?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {selectedStory.author?.display_name?.charAt(0) || selectedStory.author?.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {selectedStory.author?.display_name || selectedStory.author?.username}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {new Date(selectedStory.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeStoryViewer}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1 bg-white/30 rounded-full mt-3">
                <div className="h-full bg-white rounded-full w-1/3"></div>
              </div>
            </div>

            {/* Story Content */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedStory.content_type === 'text' ? (
                <div 
                  className="w-full h-full flex items-center justify-center p-8"
                  style={{ backgroundColor: selectedStory.background_color || '#1a1a1a' }}
                >
                  <p className="text-white text-xl text-center font-medium">
                    {selectedStory.content_encrypted}
                  </p>
                </div>
              ) : selectedStory.content_type === 'image' ? (
                <img
                  src={selectedStory.media_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              ) : selectedStory.content_type === 'video' ? (
                <video
                  src={selectedStory.media_url}
                  className="w-full h-full object-cover"
                  controls={false}
                  autoPlay={isPlaying}
                />
              ) : null}
            </div>

            {/* Story Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedStory.allow_reactions && (
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Heart className="w-5 h-5" />
                    </Button>
                  )}
                  {selectedStory.allow_replies && (
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-white text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{selectedStory.view_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesViewer;
