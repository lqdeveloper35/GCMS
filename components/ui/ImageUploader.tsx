import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from '../icons/UploadCloudIcon';

interface ImageUploaderProps {
    onImageUpload: (file: File | null) => void;
    imagePreview: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreview }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    };
    
    const handleRemoveImage = () => {
        onImageUpload(null);
    }

    return (
        <div className="w-full">
            {imagePreview ? (
                <div className="mt-2 relative group">
                    <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-80 object-contain rounded-lg border border-gray-200" />
                    <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 leading-none hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100">&times;</button>
                </div>
            ) : (
                <label
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`flex justify-center w-full h-48 px-6 transition bg-white border-2 ${isDragging ? 'border-blue-500' : 'border-slate-500'} border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
                >
                    <span className="flex items-center space-x-2">
                        <UploadCloudIcon className="w-8 h-8 text-gray-400" />
                        <span className="font-medium text-gray-500">
                            Arraste uma imagem ou{' '}
                            <span className="text-blue-600 underline">clique para selecionar</span>
                        </span>
                    </span>
                    <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            )}
        </div>
    );
};