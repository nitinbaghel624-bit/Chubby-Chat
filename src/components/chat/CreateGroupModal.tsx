import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Check, Search, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser } = useAuth();
  const { createGroupChat } = useChat();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const availableUsers = allUsers.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    createGroupChat(groupName.trim(), selectedUserIds, undefined, description.trim() || undefined);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Group Chat" maxWidth="md">
      <div className="flex flex-col gap-4">
        {/* Group Name & Description */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name (e.g. Design Club, Weekend Trip)..."
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-pink-500 border border-zinc-200 dark:border-zinc-700"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description or topic (optional)..."
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none border border-zinc-200 dark:border-zinc-700"
          />
        </div>

        {/* Member Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members to add..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none border border-zinc-200 dark:border-zinc-700"
          />
        </div>

        {/* Selected Chips */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedUserIds.map((id) => {
              const u = allUsers.find((user) => user.id === id);
              if (!u) return null;
              return (
                <span
                  key={id}
                  onClick={() => toggleSelectUser(id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 cursor-pointer hover:bg-pink-500/20"
                >
                  <Avatar src={u.avatar} size="xs" />
                  <span>{u.displayName}</span>
                  <span>×</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Users List */}
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {availableUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            return (
              <div
                key={user.id}
                onClick={() => toggleSelectUser(user.id)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} size="sm" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                      {user.displayName}
                    </span>
                    <span className="text-[11px] text-zinc-400">@{user.username}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            disabled={!groupName.trim() || selectedUserIds.length === 0}
            onClick={handleCreate}
            leftIcon={<Users className="w-4 h-4" />}
          >
            Create Group ({selectedUserIds.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
