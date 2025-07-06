import React, { useState, useCallback } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ImageUploader } from '../ui/ImageUploader';
import { ResultDisplay } from '../ui/ResultDisplay';
import { ImageGenerationPanel, ImageGenerationConfig } from '../ui/ImageGenerationPanel';
import * as geminiService from '../../services/geminiService';

interface ContentAnalysisProps {
    setContentPrompt: (prompt: string) => void;
}

export const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ setContentPrompt }) => {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setUploadedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setUploadedImage(null);
            setImagePreview(null);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!uploadedImage) {
            setError('Por favor, envie uma imagem para analisar.');
            return;
        }
        setLoading(true);
        setError('');
        setGeneratedPrompt('');
        setGeneratedImages([]);
        try {
            const instruction = `Analise o conteúdo da imagem (assuntos, objetos, ações, ambiente) e gere um prompt de imagem detalhado em inglês. O prompt deve ser otimizado para gerar uma imagem semelhante que preencha toda a tela. Foco nos elementos de conteúdo. Sua saída deve ser apenas o texto do prompt.`;
            const result = await geminiService.analyzeImageAndCreatePrompt(uploadedImage, instruction);
            setGeneratedPrompt(result);
            setContentPrompt(result);
        } catch (err) {
            setError("Falha ao analisar o conteúdo da imagem.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [uploadedImage, setContentPrompt]);

    const handleGenerateImage = useCallback(async (config: ImageGenerationConfig) => {
        if (!generatedPrompt) return;
        setImageLoading(true);
        setError('');
        setGeneratedImages([]);
        try {
            const fullPrompt = `${generatedPrompt}, ${config.quality} --ar ${config.aspectRatio}`;
            const imageUrls = await geminiService.generateImage(fullPrompt, config.variations);
            setGeneratedImages(imageUrls);
        } catch (err) {
            setError("Falha ao gerar a imagem.");
            console.error(err);
        } finally {
            setImageLoading(false);
        }
    }, [generatedPrompt]);

    return (
        <Card>
            <CardHeader title="Análise de Imagem (Conteúdo)" description="Envie uma imagem para a IA analisar o conteúdo e gerar um prompt." />

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} />
            <Button onClick={handleAnalyze} isLoading={loading} className="mt-6" disabled={!uploadedImage}>Analisar Conteúdo e Gerar Prompt</Button>

            <ResultDisplay
                label="Prompt de Conteúdo Gerado"
                content={generatedPrompt}
                imageContents={generatedImages}
                isLoading={loading}
                isImageLoading={imageLoading}
            />
            {generatedPrompt && !loading && (
                 <ImageGenerationPanel
                    prompt={generatedPrompt}
                    isGenerating={imageLoading}
                    onGenerate={handleGenerateImage}
                />
            )}
        </Card>
    );
};