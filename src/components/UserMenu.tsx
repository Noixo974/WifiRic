import React, { useRef, useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onProfileClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onProfileClick }) => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    onProfileClick();
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  const avatarUrl = user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-[#9cd4e3] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <img
          src={avatarUrl}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user.username}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-3 text-left flex items-center space-x-2 hover:bg-gradient-to-r hover:from-[#9cd4e3]/10 hover:to-blue-500/10 transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profil</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border-t border-gray-200 dark:border-gray-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
};
