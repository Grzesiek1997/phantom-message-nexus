
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';

interface ReactionPickerProps {
  onReactionSelect: (reaction: string) => void;
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯', '🎉'];

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onReactionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReactionClick = (reaction: string) => {
    onReactionSelect(reaction);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
        <div className="grid grid-cols-5 gap-1">
          {COMMON_REACTIONS.map((reaction) => (
            <Button
              key={reaction}
              variant="ghost"
              size="sm"
              onClick={() => handleReactionClick(reaction)}
              className="h-8 w-8 p-0 text-lg hover:bg-gray-700 rounded"
            >
              {reaction}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReactionPicker;
