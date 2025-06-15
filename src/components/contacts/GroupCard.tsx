
import React from 'react';
import { Users, MoreVertical } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActivity: Date;
}

interface GroupCardProps {
  group: Group;
  formatLastActivity: (date: Date) => string;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, formatLastActivity }) => {
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
      <button className="p-2 text-gray-400 hover:text-white transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
};

export default GroupCard;
