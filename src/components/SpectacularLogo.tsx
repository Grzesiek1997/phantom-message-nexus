import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Zap, Shield, Atom, Sparkles } from "lucide-react";

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

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.8,
      },
    },
  };

  const quantumVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateY: 90,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        delay: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const particleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        delay: i * 0.1,
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
      },
    }),
  };

  const quantumGlowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(34, 197, 94, 0.5)",
        "0 0 40px rgba(34, 197, 94, 0.8)",
        "0 0 20px rgba(34, 197, 94, 0.5)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const atomOrbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {/* Main Logo */}
      <motion.div
        variants={animated ? logoVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        whileHover={
          animated
            ? {
                scale: 1.1,
                rotate: 5,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }
            : undefined
        }
        className={`relative ${config.logoSize} bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl`}
      >
        {/* Main Icon */}
        <MessageCircle
          className={`${config.iconSize} text-white relative z-10`}
        />

        {/* Quantum Particles */}
        {animated && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={particleVariants}
                initial="hidden"
                animate="visible"
                className="absolute w-1 h-1 bg-cyan-300 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${i * 60}deg) translateY(-20px)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Atom Orbits */}
        {animated && (
          <motion.div
            variants={atomOrbitVariants}
            animate="animate"
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-2 border border-cyan-300/30 rounded-full">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50" />
            </div>
          </motion.div>
        )}

        {/* Pulsing Background */}
        {animated && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl -z-10"
          />
        )}
      </motion.div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          {/* SecureChat */}
          <motion.h1
            initial={animated ? { opacity: 0, x: -20 } : undefined}
            animate={animated ? { opacity: 1, x: 0 } : undefined}
            transition={
              animated
                ? { delay: 0.3, type: "spring", stiffness: 300 }
                : undefined
            }
            className={`${config.textSize} font-bold text-white bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent leading-none`}
          >
            SecureChat
          </motion.h1>

          {/* Quantum - Animated */}
          <motion.div
            variants={animated ? quantumVariants : undefined}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            className="relative"
          >
            <motion.div
              variants={animated ? quantumGlowVariants : undefined}
              animate={animated ? "animate" : undefined}
              className={`${config.quantumSize} font-extrabold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent inline-flex items-center space-x-1 rounded-lg px-2 py-1`}
            >
              {/* Quantum Icon */}
              <motion.div
                animate={
                  animated
                    ? {
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }
                    : undefined
                }
                transition={
                  animated
                    ? {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : undefined
                }
              >
                <Atom className="w-4 h-4 text-green-400" />
              </motion.div>

              {/* Quantum Text with Letter Animation */}
              <span className="relative">
                {"QUANTUM".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    animate={
                      animated
                        ? {
                            y: [0, -2, 0],
                            textShadow: [
                              "0 0 0px rgba(34, 197, 94, 0)",
                              "0 0 8px rgba(34, 197, 94, 0.8)",
                              "0 0 0px rgba(34, 197, 94, 0)",
                            ],
                          }
                        : undefined
                    }
                    transition={
                      animated
                        ? {
                            delay: index * 0.1,
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }
                        : undefined
                    }
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>

              {/* Energy Sparkles */}
              {animated && (
                <div className="absolute -inset-1 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        delay: i * 0.5,
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="absolute"
                      style={{
                        left: `${25 + i * 25}%`,
                        top: i % 2 === 0 ? "-2px" : "100%",
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quantum Field Effect */}
            {animated && (
              <motion.div
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-lg blur-sm -z-10"
              />
            )}
          </motion.div>
        </div>
      )}

      {/* Floating Energy Particles */}
      {animated && showText && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                delay: i * 0.5,
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-1 h-1 bg-gradient-to-r from-cyan-300 to-green-300 rounded-full shadow-lg"
              style={{
                left: `${10 + i * 10}%`,
                bottom: "0%",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SpectacularLogo;
