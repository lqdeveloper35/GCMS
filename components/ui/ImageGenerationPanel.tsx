import React, { useState } from 'react';
import { Button } from './Button';
import { Select } from './Select';
import { Input } from './Input';
import { ImageIcon } from '../icons/ImageIcon';
import { VideoIcon } from '../icons/VideoIcon';
import { AspectRatio } from '../../types';

export interface ImageGenerationConfig {
    aspectRatio: AspectRatio;
    variations: number;
    quality: string;
}

interface ImageGenerationPanelProps {
    onGenerate: (config: ImageGenerationConfig) => void;
    isGenerating: boolean;
    prompt: string;
}

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = ({ onGenerate, isGenerating, prompt }) => {
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
    const [variations, setVariations] = useState(1);
    const [quality, setQuality] = useState('HD');

    const handleGenerateClick = () => {
        onGenerate({ aspectRatio, variations, quality });
    };

    return (
        <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
             <h4 className="text-md font-semibold text-gray-800 mb-3">Controles de Geração de Mídia</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                 <Select
                    label="Aspect Ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                >
                    {Object.entries(AspectRatio).map(([key, value]) => (
                        <option key={key} value={value}>{value}</option>
                    ))}
                </Select>
                 <Select label="Qualidade" value={quality} onChange={e => setQuality(e.target.value)}>
                    <option value="standard definition">Padrão</option>
                    <option value="HD">HD</option>
                    <option value="4K ultra high definition">4K</option>
                </Select>
                <Input
                    label="Variações (1-4)"
                    type="number"
                    min="1"
                    max="4"
                    value={variations}
                    onChange={(e) => setVariations(Math.max(1, Math.min(4, Number(e.target.value))))}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateClick} isLoading={isGenerating} disabled={!prompt}>
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Gerar Imagem
                </Button>
                <Button variant="secondary" disabled={true} title="Funcionalidade futura">
                    <VideoIcon className="w-5 h-5 mr-2" />
                    Gerar Vídeo
                </Button>
            </div>
        </div>
    );
};