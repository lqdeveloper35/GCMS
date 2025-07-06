import React, { useState, useCallback } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { PostType, AspectRatio } from '../../types';
import * as geminiService from '../../services/geminiService';
import { ResultDisplay } from '../ui/ResultDisplay';
import { ImageGenerationPanel, ImageGenerationConfig } from '../ui/ImageGenerationPanel';


interface CarouselItem {
    id: number;
    imagePrompt: string;
    slideText: string;
    generatedImages: string[];
    isImageLoading: boolean;
}

export const CarouselPromptGenerator: React.FC = () => {
    const [postType, setPostType] = useState<PostType>(PostType.CARROSSEL);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
    const [promptCount, setPromptCount] = useState(3);
    const [idea, setIdea] = useState('');
    const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGeneratePrompts = useCallback(async () => {
        if (!idea) {
            setError('Por favor, descreva a ideia geral do carrossel.');
            return;
        }
        setLoading(true);
        setError('');
        setCarouselItems([]);
        try {
            const prompt = `Você é um estrategista de mídia social e copywriter. Gere ${promptCount} itens para um carrossel de rede social.
            - Ideia central: "${idea}"
            - Tipo de Postagem: ${postType}
            - Aspect Ratio para as imagens: ${aspectRatio}
            
            Para cada item, forneça um prompt de imagem detalhado em inglês e um texto de slide (legenda/texto para a imagem) em português.
            - O prompt da primeira imagem deve ser para uma capa de banner corporativo atraente sobre a ideia central.
            - Os prompts das imagens subsequentes devem ser para imagens com fundo branco e uma moldura corporativa, sem texto sobreposto, cada uma focando em um aspecto da ideia central.
            - O texto do slide deve ser conciso e relevante para a imagem.

            Sua resposta DEVE ser um array JSON de objetos. Cada objeto deve ter duas chaves: "imagePrompt" (string, o prompt para gerar a imagem) e "slideText" (string, o texto que aparecerá no slide).`;
            
            const result = await geminiService.generateText(prompt, true);
            const parsedItems: { imagePrompt: string, slideText: string }[] = JSON.parse(result);

            if (Array.isArray(parsedItems) && parsedItems.every(item => 'imagePrompt' in item && 'slideText' in item)) {
                setCarouselItems(parsedItems.map((item, i) => ({ 
                    id: i, 
                    imagePrompt: item.imagePrompt,
                    slideText: item.slideText,
                    generatedImages: [], 
                    isImageLoading: false 
                })));
            } else {
                throw new Error("A resposta da IA não continha o array de objetos esperado com 'imagePrompt' e 'slideText'.");
            }
        } catch (err) {
            setError("Falha ao gerar os prompts do carrossel. Verifique o console para mais detalhes.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [idea, promptCount, postType, aspectRatio]);
    
    const handleImagePromptChange = (index: number, newPrompt: string) => {
        setCarouselItems(currentItems => 
            currentItems.map((item, i) => i === index ? { ...item, imagePrompt: newPrompt } : item)
        );
    };

    const handleSlideTextChange = (index: number, newText: string) => {
        setCarouselItems(currentItems => 
            currentItems.map((item, i) => i === index ? { ...item, slideText: newText } : item)
        );
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleGenerateImage = useCallback(async (index: number, config: ImageGenerationConfig) => {
        const targetPrompt = carouselItems[index];
        if (!targetPrompt) return;

        setCarouselItems(ps => ps.map((p, i) => i === index ? { ...p, isImageLoading: true, generatedImages: [] } : p));
        setError('');
        try {
            const fullPrompt = `${targetPrompt.imagePrompt}, ${config.quality} --ar ${config.aspectRatio}`;
            const imageUrls = await geminiService.generateImage(fullPrompt, config.variations);
            setCarouselItems(ps => ps.map((p, i) => i === index ? { ...p, generatedImages: imageUrls } : p));
        } catch (err) {
            setError(`Falha ao gerar imagem para o prompt #${index + 1}.`);
            console.error(err);
        } finally {
            setCarouselItems(ps => ps.map((p, i) => i === index ? { ...p, isImageLoading: false } : p));
        }
    }, [carouselItems]);

    return (
        <Card>
            <CardHeader title="Gerador de Prompts para Carrossel" description="Crie múltiplos prompts de imagem e textos de slide para carrosséis de mídia social." />
             {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Select label="Tipo de Postagem" value={postType} onChange={e => setPostType(e.target.value as PostType)}>
                    {Object.values(PostType).map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                 <Select label="Aspect Ratio Padrão" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)}>
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
                 <Input label="Nº de Slides (1-10)" type="number" min="1" max="10" value={promptCount} onChange={e => setPromptCount(Number(e.target.value))} />
            </div>
            <Textarea label="Ideia Geral do Carrossel (para IA gerar prompts)" value={idea} onChange={e => setIdea(e.target.value)} rows={3} placeholder="Ex: 5 dicas para melhorar o engajamento no Instagram em 2024" />
            <Button onClick={handleGeneratePrompts} isLoading={loading} className="mt-4">Gerar Prompts e Textos</Button>

            {loading && <div className="mt-6 text-center">Gerando conteúdo do carrossel...</div>}

            {carouselItems.length > 0 && (
                <div className="mt-8 space-y-8">
                    <h3 className="text-xl font-bold">Conteúdo Gerado (edite se necessário)</h3>
                    {carouselItems.map((item, index) => (
                         <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                            <h4 className="font-bold text-lg text-gray-800">Slide #{index + 1}</h4>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{`Prompt da Imagem`}</label>
                                <Textarea 
                                    value={item.imagePrompt} 
                                    onChange={e => handleImagePromptChange(index, e.target.value)}
                                    rows={4}
                                />
                                <div className="mt-2 text-right">
                                    <Button variant="secondary" size="sm" onClick={() => handleCopy(item.imagePrompt)}>
                                        Copiar Prompt
                                    </Button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{`Texto para Imagem/Slide`}</label>
                                <Textarea 
                                    value={item.slideText} 
                                    onChange={e => handleSlideTextChange(index, e.target.value)}
                                    rows={3}
                                />
                                <div className="mt-2 text-right">
                                     <Button variant="secondary" size="sm" onClick={() => handleCopy(item.slideText)}>
                                        Copiar Texto do Slide
                                    </Button>
                                </div>
                            </div>

                            <ResultDisplay 
                                label=""
                                content=""
                                imageContents={item.generatedImages}
                                isImageLoading={item.isImageLoading}
                            />
                            <ImageGenerationPanel 
                                prompt={item.imagePrompt}
                                isGenerating={item.isImageLoading}
                                onGenerate={(config) => handleGenerateImage(index, config)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};