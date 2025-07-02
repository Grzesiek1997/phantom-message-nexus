import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Clock,
  User,
  MessageCircle,
  Calendar,
  Star,
  Shield,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FixedFriendRequest } from "@/hooks/useFixedFriendRequests";
import { cn } from "@/lib/utils";

interface EnhancedFriendRequestCardProps {
  request: FixedFriendRequest;
  type: "received" | "sent";
  onAccept?: (requestId: string) => Promise<boolean>;
  onReject?: (requestId: string) => Promise<boolean>;
  onDelete?: (requestId: string) => Promise<boolean>;
  isProcessing?: boolean;
  className?: string;
}

const EnhancedFriendRequestCard: React.FC<EnhancedFriendRequestCardProps> = ({
  request,
  type,
  onAccept,
  onReject,
  onDelete,
  isProcessing = false,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);

  const profile =
    type === "received" ? request.sender_profile : request.receiver_profile;
  const displayName =
    profile?.display_name || profile?.username || "Nieznany użytkownik";
  const username = profile?.username;
  const initials = displayName.charAt(0).toUpperCase();

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Przed chwilą";
    if (diffInMinutes < 60) return `${diffInMinutes}m temu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h temu`;
    return `${Math.floor(diffInMinutes / 1440)}d temu`;
  };

  const handleAction = async (action: "accept" | "reject" | "delete") => {
    setActionProcessing(action);

    try {
      let success = false;

      switch (action) {
        case "accept":
          if (onAccept) success = await onAccept(request.id);
          break;
        case "reject":
          if (onReject) success = await onReject(request.id);
          break;
        case "delete":
          if (onDelete) success = await onDelete(request.id);
          break;
      }

      return success;
    } finally {
      setActionProcessing(null);
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10"
          >
            <Clock className="w-3 h-3 mr-1" />
            Oczekuje
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="text-green-400 border-green-400/50 bg-green-400/10"
          >
            <Check className="w-3 h-3 mr-1" />
            Zaakceptowane
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="text-red-400 border-red-400/50 bg-red-400/10"
          >
            <X className="w-3 h-3 mr-1" />
            Odrzucone
          </Badge>
        );
      default:
        return null;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.3,
      },
    },
    exit: {
      opacity: 0,
      x: type === "received" ? -100 : 100,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn("w-full", className)}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            {/* User Info Section */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Enhanced Avatar */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="w-14 h-14 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-transparent">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Online indicator */}
                {profile?.is_online && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                  />
                )}

                {/* Request type indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs",
                    type === "received"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-blue-500 to-cyan-600",
                  )}
                >
                  {type === "received" ? "📨" : "📤"}
                </motion.div>
              </motion.div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-semibold text-lg truncate">
                    {displayName}
                  </h3>
                  {request.attempt_count > 1 && (
                    <Badge
                      variant="outline"
                      className="text-orange-400 border-orange-400/50 bg-orange-400/10 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {request.attempt_count}x
                    </Badge>
                  )}
                </div>

                {username && username !== displayName && (
                  <p className="text-gray-400 text-sm mb-2">@{username}</p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatTimeAgo(request.created_at)}
                  </span>

                  {type === "received" && (
                    <span className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Zaproszenie
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-2">{getStatusBadge()}</div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-start space-x-2 ml-4">
              {/* Details Toggle */}
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </motion.div>

              {/* Action Buttons for Received Requests */}
              {type === "received" && request.status === "pending" && (
                <div className="flex space-x-2">
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={() => handleAction("accept")}
                      disabled={isProcessing || actionProcessing === "accept"}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-4 py-2 shadow-lg"
                    >
                      {actionProcessing === "accept" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Clock className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      onClick={() => handleAction("reject")}
                      disabled={isProcessing || actionProcessing === "reject"}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl px-4 py-2 shadow-lg"
                    >
                      {actionProcessing === "reject" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Clock className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* More Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900/95 border-white/10 backdrop-blur-sm"
                >
                  {request.status === "accepted" && (
                    <DropdownMenuItem className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Rozpocznij czat
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => handleAction("delete")}
                    disabled={actionProcessing === "delete"}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {actionProcessing === "delete"
                      ? "Usuwanie..."
                      : "Usuń zaproszenie"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Expandable Details Section */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">ID zaproszenia</p>
                    <p className="text-white font-mono text-xs truncate">
                      {request.id.slice(0, 8)}...
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 mb-1">Ostatnia aktualizacja</p>
                    <p className="text-white text-xs">
                      {formatTimeAgo(request.updated_at)}
                    </p>
                  </div>

                  {request.attempt_count > 1 && (
                    <div className="col-span-2">
                      <p className="text-gray-400 mb-1">Historia zaproszeń</p>
                      <p className="text-orange-400 text-xs">
                        To jest {request.attempt_count}. próba zaproszenia
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing Overlay */}
          {(isProcessing || actionProcessing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default EnhancedFriendRequestCard;
