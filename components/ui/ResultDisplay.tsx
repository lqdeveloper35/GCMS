import React from 'react';
import { DownloadIcon } from '../icons/DownloadIcon';
import { Button } from './Button';

interface ResultDisplayProps {
    label: string;
    content: string;
    imageContents?: string[];
    isLoading?: boolean;
    isImageLoading?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
    label,
    content,
    imageContents,
    isLoading = false,
    isImageLoading = false,
}) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <pre className="text-gray-800 whitespace-pre-wrap break-words text-sm font-sans">{content || 'Aguardando geração...'}</pre>
                )}
            </div>

            {content && !isLoading && (
                 <div className="mt-2 text-right">
                    <Button onClick={handleCopy} variant="secondary">
                        Copiar Prompt
                    </Button>
                </div>
            )}


            {isImageLoading && (
                 <div className="mt-4 w-full h-64 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-3 text-gray-500">Gerando imagem(ns)...</p>
                    </div>
                </div>
            )}

            {imageContents && imageContents.length > 0 && !isImageLoading && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageContents.map((imageSrc, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={imageSrc} alt={`Generated ${index + 1}`} className="w-full h-full object-contain rounded-lg border border-gray-200" />
                            <a
                                href={imageSrc}
                                download={`generated-image-${index + 1}.jpg`}
                                className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Baixar Imagem"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};