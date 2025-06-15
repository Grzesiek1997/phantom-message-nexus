
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload } from 'lucide-react';
import { useMessageAttachments } from '@/hooks/useMessageAttachments';

interface AttachmentUploadProps {
  messageId?: string;
  onAttachmentUploaded?: (attachment: any) => void;
  disabled?: boolean;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  messageId,
  onAttachmentUploaded,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadAttachment } = useMessageAttachments();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !messageId) return;

    const attachment = await uploadAttachment(file, messageId);
    if (attachment && onAttachmentUploaded) {
      onAttachmentUploaded(attachment);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled || uploading || !messageId}
        className="text-gray-400 hover:text-white"
      >
        {uploading ? (
          <Upload className="w-5 h-5 animate-spin" />
        ) : (
          <Paperclip className="w-5 h-5" />
        )}
      </Button>
    </>
  );
};

export default AttachmentUpload;
