import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ResultDisplay } from '../ui/ResultDisplay';
import { ImageGenerationPanel, ImageGenerationConfig } from '../ui/ImageGenerationPanel';
import * as geminiService from '../../services/geminiService';

interface MergePromptsProps {
    designPrompt: string;
    contentPrompt: string;
    setMergedPrompt: (prompt: string) => void;
}

export const MergePrompts: React.FC<MergePromptsProps> = ({ designPrompt, contentPrompt, setMergedPrompt }) => {
    const [localMergedPrompt, setLocalMergedPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState('');

     useEffect(() => {
        if (!designPrompt || !contentPrompt) {
            setLocalMergedPrompt('');
            setGeneratedImages([]);
            setError('');
        }
    }, [designPrompt, contentPrompt]);

    const handleMerge = useCallback(async () => {
        if (!designPrompt || !contentPrompt) {
            setError('É necessário um prompt de design e um de conteúdo para mesclar.');
            return;
        }
        setLoading(true);
        setError('');
        setLocalMergedPrompt('');
        setGeneratedImages([]);
        try {
            const prompt = `Você é um mestre em engenharia de prompts. Combine o "Prompt de Design" e o "Prompt de Conteúdo" em um único prompt de geração de imagem, detalhado e coeso em inglês. O prompt final deve criar uma imagem que incorpore tanto o estilo do design quanto os elementos do conteúdo.
            ---
            Prompt de Design: "${designPrompt}"
            ---
            Prompt de Conteúdo: "${contentPrompt}"
            ---
            Sua saída deve ser apenas o novo prompt mesclado.`;
            const result = await geminiService.generateText(prompt);
            setLocalMergedPrompt(result);
            setMergedPrompt(result);
        } catch (err) {
            setError("Falha ao mesclar os prompts.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [designPrompt, contentPrompt, setMergedPrompt]);

    const handleGenerateImage = useCallback(async (config: ImageGenerationConfig) => {
        if (!localMergedPrompt) return;
        setImageLoading(true);
        setError('');
        setGeneratedImages([]);
        try {
            const fullPrompt = `${localMergedPrompt}, ${config.quality} --ar ${config.aspectRatio}`;
            const imageUrls = await geminiService.generateImage(fullPrompt, config.variations);
            setGeneratedImages(imageUrls);
        } catch (err) {
            setError("Falha ao gerar a imagem.");
            console.error(err);
        } finally {
            setImageLoading(false);
        }
    }, [localMergedPrompt]);
    
    if (!designPrompt || !contentPrompt) {
        return (
            <Card>
                <CardHeader title="Mesclar Prompts" description="Combine um prompt de design e um de conteúdo." />
                <div className="text-center py-10 text-gray-500">
                    <p>Gere um prompt de design e um de conteúdo nas seções anteriores para habilitar a mesclagem.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader title="Mesclar Prompts" description="Combine um prompt de design e um de conteúdo para criar um prompt unificado." />
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt de Design a ser Usado</label>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 h-40 overflow-y-auto"><p className="text-gray-600 text-xs">{designPrompt}</p></div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt de Conteúdo</label>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 h-40 overflow-y-auto"><p className="text-gray-600 text-xs">{contentPrompt}</p></div>
                </div>
            </div>

            <Button onClick={handleMerge} isLoading={loading}>Mesclar Prompts</Button>

            <ResultDisplay
                label="Prompt Mesclado"
                content={localMergedPrompt}
                imageContents={generatedImages}
                isLoading={loading}
                isImageLoading={imageLoading}
            />
             {localMergedPrompt && !loading && (
                 <ImageGenerationPanel
                    prompt={localMergedPrompt}
                    isGenerating={imageLoading}
                    onGenerate={handleGenerateImage}
                />
            )}
        </Card>
    );
};