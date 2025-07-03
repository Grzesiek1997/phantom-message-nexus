import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Settings,
  Bell,
  Search,
  Menu,
  ArrowLeft,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import SpectacularLogo from "@/components/SpectacularLogo";

interface SimpleAppHeaderProps {
  totalUnreadCount?: number;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
  onSignOut?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

const SimpleAppHeader: React.FC<SimpleAppHeaderProps> = ({
  totalUnreadCount = 0,
  onNotificationClick,
  onSearchClick,
  onSignOut,
  showBackButton = false,
  onBackClick,
  className,
}) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getUserInitial = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-lg border-b border-white/10 shadow-lg"
          : "bg-gradient-to-r from-gray-900/80 via-blue-900/80 to-purple-900/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBackClick}
                  className="text-white hover:bg-white/10 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </motion.div>
            )}

            <SpectacularLogo size="small" showText={true} animated={false} />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchClick}
                className="text-white hover:bg-white/10 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Notifications Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationClick}
                className="text-white hover:bg-white/10 rounded-xl relative"
              >
                <Bell className="w-5 h-5" />
                {totalUnreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="destructive"
                      className="w-5 h-5 text-xs flex items-center justify-center bg-red-500 hover:bg-red-600"
                    >
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-xl p-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {getUserInitial()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-gray-900/95 border-white/10 backdrop-blur-sm"
                align="end"
                forceMount
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none text-white">
                      {user?.user_metadata?.display_name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {user?.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Ustawienia</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Bezpieczeństwo</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    onClick={onSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Wyloguj się</span>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default SimpleAppHeader;