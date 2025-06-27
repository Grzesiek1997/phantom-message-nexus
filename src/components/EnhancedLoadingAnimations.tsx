import React from "react";
import { motion } from "framer-motion";
import { Users, Heart, Sparkles, Zap, Crown, Star } from "lucide-react";

interface EnhancedLoadingAnimationsProps {
  type?: "contacts" | "friends" | "search" | "general";
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const EnhancedLoadingAnimations: React.FC<EnhancedLoadingAnimationsProps> = ({
  type = "general",
  message,
  showProgress = false,
  progress = 0,
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case "contacts":
        return {
          icon: Users,
          title: "Ładowanie kontaktów...",
          subtitle: "Przygotowujemy Twoją listę znajomych",
          color: "from-blue-500 to-cyan-600",
          particles: ["👥", "🤝", "💫", "✨"],
        };
      case "friends":
        return {
          icon: Heart,
          title: "Synchronizacja znajomości...",
          subtitle: "Aktualizujemy status Twoich znajomych",
          color: "from-pink-500 to-red-600",
          particles: ["💖", "🌟", "💝", "🎉"],
        };
      case "search":
        return {
          icon: Sparkles,
          title: "Wyszukiwanie użytkowników...",
          subtitle: "Szukamy idealnych znajomych dla Ciebie",
          color: "from-purple-500 to-pink-600",
          particles: ["🔍", "🌈", "⭐", "🎯"],
        };
      default:
        return {
          icon: Zap,
          title: "Ładowanie...",
          subtitle: "Przygotowujemy wszystko dla Ciebie",
          color: "from-green-500 to-blue-600",
          particles: ["⚡", "🚀", "✨", "🌟"],
        };
    }
  };

  const content = getLoadingContent();
  const IconComponent = content.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.6 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring", duration: 0.8, bounce: 0.5 },
    },
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 1,
      },
    }),
  };

  const progressVariants = {
    hidden: { width: "0%" },
    visible: {
      width: `${progress}%`,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {content.particles.map((particle, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={particleVariants}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${20 + index * 20}%`,
              top: `${10 + index * 15}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {particle}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        variants={itemVariants}
        className="relative z-10 text-center max-w-md mx-auto px-6"
      >
        {/* Animated Icon */}
        <motion.div
          variants={iconVariants}
          className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-r ${content.color} flex items-center justify-center shadow-2xl relative`}
        >
          <IconComponent className="w-12 h-12 text-white" />

          {/* Pulsing Ring */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${content.color} opacity-30`}
          />

          {/* Orbiting Stars */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3 + index,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0"
            >
              <Star
                className="absolute w-4 h-4 text-yellow-300"
                style={{
                  top: `${-10 + index * 5}px`,
                  right: `${-10 + index * 5}px`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Text Content */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
        >
          {content.title}
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-gray-300 text-lg mb-8 leading-relaxed"
        >
          {message || content.subtitle}
        </motion.p>

        {/* Progress Bar */}
        {showProgress && (
          <motion.div variants={itemVariants} className="w-full mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Postęp</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                variants={progressVariants}
                className={`h-full bg-gradient-to-r ${content.color} rounded-full relative`}
              >
                <motion.div
                  animate={{
                    x: [-20, 100],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-white/30 rounded-full"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Animated Dots */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
              className="w-3 h-3 bg-blue-400 rounded-full"
            />
          ))}
        </motion.div>

        {/* Success Animation Trigger */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={progress >= 100 ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
          >
            <Crown className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Background Glow Effect */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute inset-0 bg-gradient-to-r ${content.color} blur-3xl`}
      />
    </motion.div>
  );
};

export default EnhancedLoadingAnimations;
