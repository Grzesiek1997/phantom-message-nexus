import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Atom } from "lucide-react";

interface SpectacularLogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const SpectacularLogo: React.FC<SpectacularLogoProps> = ({
  size = "medium",
  showText = true,
  animated = true,
  className = "",
}) => {
  const sizeConfig = {
    small: {
      logoSize: "w-8 h-8",
      iconSize: "w-4 h-4",
      textSize: "text-lg",
      quantumSize: "text-sm",
      spacing: "space-x-2",
    },
    medium: {
      logoSize: "w-12 h-12",
      iconSize: "w-6 h-6",
      textSize: "text-2xl",
      quantumSize: "text-lg",
      spacing: "space-x-3",
    },
    large: {
      logoSize: "w-20 h-20",
      iconSize: "w-10 h-10",
      textSize: "text-4xl",
      quantumSize: "text-2xl",
      spacing: "space-x-4",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Main Logo */}
      <motion.div
        initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={animated ? { duration: 0.3 } : undefined}
        whileHover={animated ? { scale: 1.05 } : undefined}
        className={`relative ${config.logoSize} bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg`}
      >
        <MessageCircle
          className={`${config.iconSize} text-white relative z-10`}
        />
      </motion.div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <motion.h1
            initial={animated ? { opacity: 0, x: -10 } : undefined}
            animate={animated ? { opacity: 1, x: 0 } : undefined}
            transition={animated ? { delay: 0.1, duration: 0.3 } : undefined}
            className={`${config.textSize} font-bold text-white bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent leading-none`}
          >
            SecureChat
          </motion.h1>

          <motion.div
            initial={animated ? { opacity: 0, x: -10 } : undefined}
            animate={animated ? { opacity: 1, x: 0 } : undefined}
            transition={animated ? { delay: 0.2, duration: 0.3 } : undefined}
            className={`${config.quantumSize} font-extrabold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent inline-flex items-center space-x-1`}
          >
            <Atom className="w-4 h-4 text-green-400" />
            <span>QUANTUM</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SpectacularLogo;