import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, File, Image, Video, Music } from 'lucide-react';

interface FileUploadProps {
  conversationId: string;
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  onClose: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  conversationId,
  onFileUploaded,
  onClose
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const generatePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [file.name]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    
    fileArray.forEach(file => {
      generatePreview(file);
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${conversationId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('message-attachments')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error);
          toast({
            title: 'Błąd uploadu',
            description: `Nie udało się przesłać pliku: ${file.name}`,
            variant: 'destructive'
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(fileName);

        // Notify parent component
        onFileUploaded(publicUrl, file.name, file.type);

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast({
        title: 'Upload zakończony',
        description: `Przesłano ${selectedFiles.length} plików`,
      });

      onClose();
    } catch (error) {
      console.error('Error in uploadFiles:', error);
      toast({
        title: 'Błąd',
        description: 'Wystąpił błąd podczas przesyłania plików',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-md mx-auto glass border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Upload plików</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white mb-2">
            Przeciągnij pliki tutaj lub kliknij aby wybrać
          </p>
          <p className="text-gray-400 text-sm">
            Obsługiwane: obrazy, wideo, audio, dokumenty
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-white font-medium">Wybrane pliki:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                  {previews[file.name] && (
                    <img
                      src={previews[file.name]}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-[150px]">
                      {file.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white mb-2">
              <span>Przesyłanie...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-600 text-white hover:bg-gray-700"
            disabled={uploading}
          >
            Anuluj
          </Button>
          <Button
            onClick={uploadFiles}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? 'Przesyłanie...' : `Upload (${selectedFiles.length})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;