import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  Archive,
  X,
  Download,
  Eye,
  Share2,
  Paperclip,
  FileText,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileShareSystemProps {
  onFilesSelected: (files: File[]) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  maxFiles?: number;
  className?: string;
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
  isUploading?: boolean;
}

interface SharedFileProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadDate: string;
  };
  isOwn?: boolean;
  onDownload?: () => void;
  onPreview?: () => void;
}

// Get file icon based on type
const getFileIcon = (type: string, size: string = "w-6 h-6") => {
  if (type.startsWith("image/")) {
    return <Image className={size} />;
  } else if (type.startsWith("video/")) {
    return <Video className={size} />;
  } else if (type.startsWith("audio/")) {
    return <Music className={size} />;
  } else if (type.includes("pdf") || type.includes("document")) {
    return <FileText className={size} />;
  } else if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("archive")
  ) {
    return <Archive className={size} />;
  } else {
    return <File className={size} />;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// File preview component
const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  uploadProgress = 0,
  isUploading = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Generate image preview for image files
  React.useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Remove button */}
      <Button
        onClick={onRemove}
        size="icon"
        variant="ghost"
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X className="w-3 h-3" />
      </Button>

      <div className="flex items-start space-x-3">
        {/* File icon or image preview */}
        <div className="flex-shrink-0">
          {imagePreview ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700">
              <img
                src={imagePreview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              {getFileIcon(file.type, "w-8 h-8 text-white")}
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{file.name}</h4>
          <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>

          {/* File type badge */}
          <Badge
            variant="outline"
            className="mt-1 text-xs border-white/20 text-gray-300"
          >
            {file.type.split("/")[1]?.toUpperCase() || "FILE"}
          </Badge>

          {/* Upload progress */}
          {isUploading && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* Hover effects */}
      <AnimatePresence>
        {isHovered && !isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/30"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Shared file component
export const SharedFileComponent: React.FC<SharedFileProps> = ({
  file,
  isOwn = false,
  onDownload,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-sm p-4 rounded-2xl shadow-lg backdrop-blur-sm border cursor-pointer",
        isOwn
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto border-transparent"
          : "bg-white/10 text-white mr-auto border-white/20",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreview}
    >
      <div className="flex items-center space-x-3">
        {/* File icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            isOwn ? "bg-white/20" : "bg-blue-500",
          )}
        >
          {getFileIcon(file.type, "w-6 h-6 text-white")}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{file.name}</h4>
          <p className="text-sm opacity-75">{formatFileSize(file.size)}</p>
          <p className="text-xs opacity-50">{file.uploadDate}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {file.type.startsWith("image/") || file.type.startsWith("video/") ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.();
              }}
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-current opacity-75 hover:opacity-100"
            >
              <Eye className="w-4 h-4" />
            </Button>
          ) : null}

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.();
            }}
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-current opacity-75 hover:opacity-100"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hover glow effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.2, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1 }}
            className="absolute inset-0 bg-white rounded-2xl -z-10"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main file share system
const FileShareSystem: React.FC<FileShareSystemProps> = ({
  onFilesSelected,
  maxFileSize = 10,
  allowedTypes = [],
  maxFiles = 5,
  className,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Plik jest za duży. Maksymalny rozmiar: ${maxFileSize}MB`;
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `Nieobsługiwany typ pliku: ${file.type}`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    (files: FileList) => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else if (validFiles.length < maxFiles) {
          validFiles.push(file);
        } else {
          errors.push(`Maksymalna liczba plików: ${maxFiles}`);
        }
      });

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
        setIsExpanded(true);
      }

      if (errors.length > 0) {
        console.warn("File validation errors:", errors);
      }
    },
    [maxFileSize, allowedTypes, maxFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendFiles = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      setIsExpanded(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* File selection area */}
      <motion.div
        animate={{
          height: isExpanded || selectedFiles.length > 0 ? "auto" : 0,
          opacity: isExpanded || selectedFiles.length > 0 ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        <div className="space-y-4 p-4 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-white/10">
          {/* Selected files */}
          <AnimatePresence>
            {selectedFiles.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
          </AnimatePresence>

          {/* Send button */}
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end space-x-2"
            >
              <Button
                onClick={() => {
                  setSelectedFiles([]);
                  setIsExpanded(false);
                }}
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                Anuluj
              </Button>
              <Button
                onClick={sendFiles}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Wyślij pliki ({selectedFiles.length})
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300",
          isDragOver
            ? "border-blue-500 bg-blue-500/10 scale-105"
            : "border-white/20 hover:border-white/40 hover:bg-white/5",
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center">
          <motion.div
            animate={{
              y: isDragOver ? -5 : 0,
              scale: isDragOver ? 1.1 : 1,
            }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4"
          >
            <Upload className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="text-white text-lg font-semibold mb-2">
            {isDragOver ? "Upuść pliki tutaj" : "Udostępnij pliki"}
          </h3>

          <p className="text-gray-400 mb-4">
            Przeciągnij i upuść pliki lub kliknij aby wybrać
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Max {maxFileSize}MB</span>
            <span>•</span>
            <span>Do {maxFiles} plików</span>
          </div>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm rounded-2xl border-2 border-blue-500 flex items-center justify-center"
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                <p className="text-blue-300 font-semibold">
                  Upuść pliki aby je dodać
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick attach button */}
      {!isExpanded && selectedFiles.length === 0 && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <Paperclip className="w-5 h-5 mr-2" />
            Załącz pliki
          </Button>
        </motion.div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        className="hidden"
        accept={allowedTypes.join(",")}
      />
    </div>
  );
};

export default FileShareSystem;
