import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  LogOut,
  Settings,
  Search,
  Menu,
  X,
  Home,
  MessageCircle,
  Users,
  Phone,
  Zap,
  Shield,
  Crown,
} from "lucide-react";
import SpectacularLogo from "../SpectacularLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EnhancedAppHeaderProps {
  totalUnreadCount?: number;
  onNotificationClick?: () => void;
  onSignOut?: () => void;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

const EnhancedAppHeader: React.FC<EnhancedAppHeaderProps> = ({
  totalUnreadCount = 0,
  onNotificationClick,
  onSignOut,
  showBackButton = true,
  title,
  subtitle,
  actions,
  className,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Auto-detect if back button should be shown
  const shouldShowBackButton = showBackButton && location.pathname !== "/";

  // Detect scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get current page info
  const getPageInfo = () => {
    const path = location.pathname;
    const hash = location.hash;

    if (title) return { title, subtitle };

    // Based on current route
    if (path === "/" || hash.includes("chats")) {
      return { title: "SecureChat Quantum", subtitle: "Bezpieczne wiadomości" };
    }
    if (hash.includes("contacts")) {
      return {
        title: "Kontakty",
        subtitle: `${totalUnreadCount > 0 ? `${totalUnreadCount} nowych` : "Zarządzaj znajomymi"}`,
      };
    }
    if (hash.includes("calls")) {
      return { title: "Połączenia", subtitle: "Historia rozmów" };
    }
    if (hash.includes("settings")) {
      return { title: "Ustawienia", subtitle: "Personalizacja aplikacji" };
    }

    return { title: "SecureChat", subtitle: "Bezpieczne wiadomości" };
  };

  const pageInfo = getPageInfo();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const headerVariants = {
    hidden: {
      opacity: 0,
      transform: "translateY(-20px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      transform: "translateY(-10px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const backButtonVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    exit: {
      x: -30,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const mobileMenuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
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
              {/* Back Button */}
              <AnimatePresence>
                {shouldShowBackButton && (
                  <motion.div
                    variants={backButtonVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spectacular Logo */}
              <motion.div variants={itemVariants} className="flex items-center">
                <SpectacularLogo
                  size="small"
                  showText={pageInfo.title === "SecureChat Quantum"}
                  animated={true}
                />

                {pageInfo.title !== "SecureChat Quantum" && (
                  <div className="ml-3 hidden sm:block">
                    <motion.h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      {pageInfo.title}
                    </motion.h1>
                    {pageInfo.subtitle && (
                      <motion.p
                        variants={itemVariants}
                        className="text-sm text-gray-300"
                      >
                        {pageInfo.subtitle}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Center Section - Empty for cleaner look */}
            <div className="flex-1" />

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Custom Actions */}
              {actions && (
                <motion.div variants={itemVariants}>{actions}</motion.div>
              )}

              {/* Search Button */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Notifications */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNotificationClick}
                  className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl relative"
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
                        className="h-5 min-w-[20px] text-xs bg-red-500 hover:bg-red-600 animate-pulse"
                      >
                        {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              {/* Settings */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/settings")}
                  className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* User Avatar */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Avatar className="w-8 h-8 ring-2 ring-white/20 ring-offset-2 ring-offset-transparent cursor-pointer">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>

                {/* Premium Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="w-2 h-2 text-white" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Sign Out */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSignOut}
                  className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Mobile Menu Toggle */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sm:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-white hover:bg-white/10 rounded-xl"
                >
                  {showMobileMenu ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        />
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 sm:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Menu */}
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-16 right-4 bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl z-40 sm:hidden overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {[
                  { icon: Home, label: "Główna", path: "/" },
                  { icon: MessageCircle, label: "Czaty", path: "/?tab=chats" },
                  { icon: Users, label: "Kontakty", path: "/?tab=contacts" },
                  { icon: Phone, label: "Połączenia", path: "/?tab=calls" },
                  { icon: Search, label: "Szukaj", action: () => {} },
                  { icon: Settings, label: "Ustawienia", path: "/settings" },
                  {
                    icon: LogOut,
                    label: "Wyloguj",
                    action: onSignOut,
                    danger: true,
                  },
                ].map((item, index) => {
                  const IconComponent = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      variants={mobileMenuItemVariants}
                      custom={index}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else if (item.path) {
                            navigate(item.path);
                          }
                          setShowMobileMenu(false);
                        }}
                        className={cn(
                          "w-full justify-start text-white hover:bg-white/10 rounded-xl",
                          item.danger &&
                            "hover:bg-red-500/10 hover:text-red-400",
                        )}
                      >
                        <IconComponent className="w-5 h-5 mr-3" />
                        {item.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedAppHeader;
