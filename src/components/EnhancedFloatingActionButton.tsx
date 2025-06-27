import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageCircle,
  UserPlus,
  Users,
  Search,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedFloatingActionButtonProps {
  onNewChat: () => void;
  onGroupChat: () => void;
  onSearchChats: () => void;
  onAddContacts: () => void;
  className?: string;
}

const EnhancedFloatingActionButton: React.FC<
  EnhancedFloatingActionButtonProps
> = ({ onNewChat, onGroupChat, onSearchChats, onAddContacts, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions = [
    {
      id: "new-chat",
      label: "Nowy czat",
      icon: MessageCircle,
      onClick: onNewChat,
      color: "from-blue-500 to-cyan-600",
      delay: 0.1,
    },
    {
      id: "add-contacts",
      label: "Dodaj kontakty",
      icon: UserPlus,
      onClick: onAddContacts,
      color: "from-green-500 to-emerald-600",
      delay: 0.2,
    },
    {
      id: "group-chat",
      label: "Grupa",
      icon: Users,
      onClick: onGroupChat,
      color: "from-purple-500 to-pink-600",
      delay: 0.3,
    },
    {
      id: "search-chats",
      label: "Szukaj czatów",
      icon: Search,
      onClick: onSearchChats,
      color: "from-orange-500 to-red-600",
      delay: 0.4,
    },
  ];

  const mainButtonVariants = {
    closed: {
      rotate: 0,
      scale: 1,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    },
    open: {
      rotate: 45,
      scale: 1.1,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      visibility: "hidden" as const,
    },
    open: {
      opacity: 1,
      visibility: "visible" as const,
    },
  };

  const actionVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      y: 20,
      rotate: -90,
    },
    open: (delay: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay,
      },
    }),
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
      },
    },
  };

  const labelVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const handleActionClick = (action: (typeof actions)[0]) => {
    action.onClick();
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-20 right-0 space-y-4">
              {actions.map((action, index) => {
                const IconComponent = action.icon;
                const isHovered = hoveredAction === action.id;

                return (
                  <motion.div
                    key={action.id}
                    custom={action.delay}
                    variants={actionVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="flex items-center space-x-3"
                  >
                    {/* Action Label */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          variants={labelVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-white/10"
                        >
                          {action.label}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Button - Fixed Positioning */}
                    <motion.div
                      variants={actionVariants}
                      onHoverStart={() => setHoveredAction(action.id)}
                      onHoverEnd={() => setHoveredAction(null)}
                      className="relative flex-shrink-0"
                      style={{ transformOrigin: "center center" }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="relative"
                      >
                        <Button
                          onClick={() => handleActionClick(action)}
                          className={cn(
                            "w-14 h-14 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-sm",
                            "bg-gradient-to-r transition-all duration-200 relative overflow-hidden",
                            action.color,
                            "hover:border-white/40 hover:shadow-xl",
                          )}
                          size="icon"
                        >
                          {/* Icon - Fixed in center */}
                          <IconComponent className="w-6 h-6 text-white relative z-10" />

                          {/* Stable glow effect */}
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 0.2, scale: 1.1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 bg-white rounded-full"
                            />
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>

                    {/* Enhanced Particle Effect - Non-interfering */}
                    <AnimatePresence>
                      {isHovered && (
                        <div className="absolute -inset-2 pointer-events-none z-0">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 0.6, 0],
                                rotate: [0, 180],
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{
                                duration: 1.5,
                                delay: i * 0.2,
                                repeat: Infinity,
                                ease: "easeOut",
                              }}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                left: "50%",
                                top: "50%",
                                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-25px)`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Main Action Button */}
        <motion.div
          variants={mainButtonVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          whileHover="hover"
          whileTap={{ scale: 0.95 }}
          className="relative"
          style={{ transformOrigin: "center center" }}
        >
          <Button
            onClick={toggleOpen}
            className={cn(
              "w-16 h-16 rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm",
              "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600",
              "hover:border-white/40 transition-all duration-300",
              "relative overflow-hidden",
            )}
            size="icon"
          >
            {/* Animated Background */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-50"
            />

            {/* Icon Container */}
            <div className="relative z-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-7 h-7 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="w-7 h-7 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pulse Effect */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />

            {/* Sparkle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotate: [0, 360],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `rotate(${i * 45}deg) translateY(-20px)`,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-white/60" />
                </motion.div>
              ))}
            </div>
          </Button>
        </motion.div>

        {/* Floating Orbs Animation */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                    opacity: [0, 0.6, 0],
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    transformOrigin: "center",
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default EnhancedFloatingActionButton;
