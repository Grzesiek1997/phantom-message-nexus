
import React from 'react';
import { Users, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActivity: Date;
}

interface GroupCardProps {
  group: Group;
  formatLastActivity: (date: Date) => string;
  onDeleteGroup?: (groupId: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, formatLastActivity, onDeleteGroup }) => {
  return (
    <div className="flex items-center p-4 hover:bg-white/5 transition-colors cursor-pointer">
      {/* Group Avatar */}
      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
        <Users className="w-6 h-6 text-white" />
      </div>

      {/* Group Info */}
      <div className="flex-1">
        <h3 className="font-medium text-white">{group.name}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>{group.memberCount} członków</span>
          <span>•</span>
          <span>{formatLastActivity(group.lastActivity)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {onDeleteGroup && (
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="p-2 text-gray-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-600">
            <DropdownMenuItem className="text-white hover:bg-gray-700">
              Zobacz szczegóły
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-gray-700">
              Ustawienia grupy
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-gray-700">
              Opuść grupę
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default GroupCard;
