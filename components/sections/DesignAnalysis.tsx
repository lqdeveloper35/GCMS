import React, { useState, useCallback } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ImageUploader } from '../ui/ImageUploader';
import { ResultDisplay } from '../ui/ResultDisplay';
import { ImageGenerationPanel, ImageGenerationConfig } from '../ui/ImageGenerationPanel';
import * as geminiService from '../../services/geminiService';
import { Input } from '../ui/Input';

interface DesignAnalysisProps {
    setDesignPrompt: (prompt: string) => void;
}

export const DesignAnalysis: React.FC<DesignAnalysisProps> = ({ setDesignPrompt }) => {
    // State for reference-based generation
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // State for niche-based generation
    const [niche, setNiche] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [nicheLoading, setNicheLoading] = useState(false);

    // Shared state
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
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

    const handleGenerateFromNiche = useCallback(async () => {
        if (!niche && !targetAudience) {
            setError('Por favor, insira o nicho e/ou o público alvo.');
            return;
        }
        setNicheLoading(true);
        setError('');
        setGeneratedPrompt('');
        setGeneratedImages([]);
        try {
            const instruction = `Você é um diretor de arte e especialista em branding. Com base no nicho de atuação "${niche}" e no público-alvo "${targetAudience}", pesquise tendências de design e padrões visuais relevantes. Crie um prompt de imagem altamente detalhado em inglês para um gerador de IA. O prompt deve descrever um conceito de design (estilo, layout, tipografia, paleta de cores, humor) que seja coerente e atraente para este segmento. Sua saída deve ser apenas o texto do prompt, nada mais.`;
            
            const result = await geminiService.generateText(instruction);

            setGeneratedPrompt(result);
            setDesignPrompt(result);
        } catch (err) {
            setError("Falha ao gerar o design com base no nicho.");
            console.error(err);
        } finally {
            setNicheLoading(false);
        }
    }, [niche, targetAudience, setDesignPrompt]);

    const handleAnalyze = useCallback(async () => {
        if (!uploadedImage && !description) {
            setError('Por favor, envie uma imagem ou descreva o design.');
            return;
        }
        setLoading(true);
        setError('');
        setGeneratedPrompt('');
        setGeneratedImages([]);
        try {
            const instruction = `Você é um diretor de arte de classe mundial e engenheiro de prompt. Analise a imagem fornecida (ou descrição) e gere um prompt de imagem altamente detalhado, descritivo e artístico em inglês para um gerador de imagens de IA como Imagen 3. O prompt deve descrever o estilo, layout, tipografia, paleta de cores, humor e todos os elementos visuais. O objetivo é criar um prompt que gere uma imagem semelhante que preencha toda a tela, sem fundo branco ou bordas. Sua saída deve ser apenas o texto do prompt, nada mais. Se houver uma descrição de texto, use-a como guia principal. Descrição: "${description}"`;

            let result: string;
            if (uploadedImage) {
                result = await geminiService.analyzeImageAndCreatePrompt(uploadedImage, instruction);
            } else {
                result = await geminiService.generateText(instruction);
            }
            setGeneratedPrompt(result);
            setDesignPrompt(result);
        } catch (err) {
            setError("Falha ao analisar o design.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [uploadedImage, description, setDesignPrompt]);

    const handleGenerateImage = useCallback(async (config: ImageGenerationConfig) => {
        if (!generatedPrompt) return;
        setImageLoading(true);
        setError('');
        setGeneratedImages([]);
        try {
            const fullPrompt = `${generatedPrompt}, ${config.quality}, cinematic, photo realistic --ar ${config.aspectRatio}`;
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
            <CardHeader title="Análise de Design com IA" description="Gere um prompt de design a partir de um nicho, uma descrição ou uma imagem de referência." />

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
            
            <div className="space-y-8">
                {/* Niche Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-800">Gerar a partir do Nicho do Cliente</h3>
                    <p className="text-sm text-gray-500 mb-3">A IA irá pesquisar e sugerir um conceito de design.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Nicho de Atuação"
                            value={niche}
                            onChange={e => setNiche(e.target.value)}
                            placeholder="Ex: Cafeteria gourmet"
                        />
                        <Input
                            label="Público Alvo"
                            value={targetAudience}
                            onChange={e => setTargetAudience(e.target.value)}
                            placeholder="Ex: Jovens adultos, urbanos"
                        />
                    </div>
                    <Button onClick={handleGenerateFromNiche} isLoading={nicheLoading} className="mt-4">Gerar Design com base no Nicho</Button>
                </div>

                <div className="text-center text-gray-400 font-semibold flex items-center">
                    <span className="flex-grow bg-gray-200 h-px"></span>
                    <span className="mx-4">OU</span>
                    <span className="flex-grow bg-gray-200 h-px"></span>
                </div>

                {/* Reference Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-800">Gerar a partir de Referência</h3>
                    <p className="text-sm text-gray-500 mb-3">Envie uma imagem ou descreva o que você tem em mente.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} />
                        <Textarea
                            label="Descreva o design desejado (texto ou voz):"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={7}
                            showSpeechButton={true}
                            placeholder="Ex: Um logo minimalista para uma cafeteria, com um grão de café estilizado, cores terrosas..."
                        />
                    </div>
                    <Button onClick={handleAnalyze} isLoading={loading} className="mt-6">Analisar Referência e Gerar Prompt</Button>
                </div>
            </div>


            {(generatedPrompt || loading || nicheLoading) && (
                <ResultDisplay
                    label="Prompt de Design Gerado (Original)"
                    content={generatedPrompt}
                    imageContents={generatedImages}
                    isLoading={loading || nicheLoading}
                    isImageLoading={imageLoading}
                />
            )}
            
            {generatedPrompt && !loading && !nicheLoading && (
                 <ImageGenerationPanel
                    prompt={generatedPrompt}
                    isGenerating={imageLoading}
                    onGenerate={handleGenerateImage}
                />
            )}
        </Card>
    );
};