
import React from 'react';
import { UserPlus } from 'lucide-react';

const GroupsTab: React.FC = () => {
  return (
    <div className="text-center py-8">
      <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
      <p className="text-gray-400">Brak grup</p>
      <p className="text-sm text-gray-500">Grupy pojawią się tutaj</p>
    </div>
  );
};

export default GroupsTab;
