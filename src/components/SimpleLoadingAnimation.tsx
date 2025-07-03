import React from "react";
import { cn } from "@/lib/utils";

interface SimpleLoadingAnimationProps {
  message?: string;
  className?: string;
}

const SimpleLoadingAnimation: React.FC<SimpleLoadingAnimationProps> = ({
  message = "Ładowanie...",
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};

export default SimpleLoadingAnimation;