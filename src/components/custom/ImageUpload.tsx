import React, { useState, useCallback } from "react";

interface ImageUploadProps {
  onUploadComplete: (base64String: string) => void;
  accept?: string;
  maxSize?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > maxSize) {
        setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        return;
      }
      if (!file.type.match("image.*")) {
        setError("Please upload an image file");
        return;
      }

      setIsUploading(true);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        onUploadComplete(base64String);
        setIsUploading(false);
      };

      reader.onerror = () => {
        setError("Failed to read the file. Please try again.");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    },
    [maxSize, onUploadComplete]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="px-2 py-2 border border-gray-300 
          rounded-md focus:outline-none focus:ring-2 
          focus:ring-blue-500 disabled:opacity-50 
          disabled:cursor-not-allowed"
        />
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover 
              border-2 border-gray-200"
            />
            {isUploading && (
              <div
                className="absolute inset-0 flex items-center 
              justify-center bg-black bg-opacity-50 rounded-full"
              >
                <div
                  className="animate-spin rounded-full h-6 w-6 
                border-b-2 border-white"
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
      {isUploading && (
        <div className="text-gray-600 italic">Processing image...</div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
};
