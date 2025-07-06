import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { ResultDisplay } from '../ui/ResultDisplay';
import { Select } from '../ui/Select';
import { ImageGenerationPanel, ImageGenerationConfig } from '../ui/ImageGenerationPanel';
import * as geminiService from '../../services/geminiService';
import { Input } from '../ui/Input';

interface ModifyPromptProps {
    originalPrompt: string;
    setModifiedPrompt: (prompt: string) => void;
}

interface SavedPalettes {
    [key: string]: string[];
}

const PREDEFINED_PALETTES: { [key: string]: string } = {
    "Pastel Colors": "Cores Pastéis",
    "Earthy Tones": "Tons Terrosos",
    "Vibrant and Neon": "Vibrante / Neon",
    "Monochromatic Grayscale": "Monocromático (Tons de Cinza)",
    "Cool Blues and Greens": "Tons Frios (Azuis e Verdes)",
    "Warm Reds and Oranges": "Tons Quentes (Vermelhos e Laranjas)",
};

export const ModifyPrompt: React.FC<ModifyPromptProps> = ({ originalPrompt, setModifiedPrompt }) => {
    const [request, setRequest] = useState('');
    const [alteredPrompt, setAlteredPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState('');
    const [removeText, setRemoveText] = useState(false);

    // Custom Palette State
    const [selectedPalette, setSelectedPalette] = useState('');
    const [customColors, setCustomColors] = useState<string[]>([]);
    const [showPaletteCreator, setShowPaletteCreator] = useState(false);
    const [newPaletteName, setNewPaletteName] = useState('');
    const [savedPalettes, setSavedPalettes] = useState<SavedPalettes>({});

    useEffect(() => {
        try {
            const storedPalettes = localStorage.getItem('custom-palettes');
            if (storedPalettes) {
                setSavedPalettes(JSON.parse(storedPalettes));
            }
        } catch (e) {
            console.error("Failed to parse custom palettes from localStorage", e);
        }
    }, []);

    useEffect(() => {
        if (!originalPrompt) {
            setRequest('');
            setAlteredPrompt('');
            setGeneratedImages([]);
            setError('');
            setSelectedPalette('');
            setRemoveText(false);
            setCustomColors([]);
            setShowPaletteCreator(false);
        }
    }, [originalPrompt]);
    
    const handlePaletteSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPalette(value);
        if (savedPalettes[value]) {
            setCustomColors(savedPalettes[value]);
            setShowPaletteCreator(true);
        } else {
             setShowPaletteCreator(false);
             setCustomColors([]);
        }
    }

    const handleAddColor = () => setCustomColors([...customColors, '#ffffff']);
    
    const handleColorChange = (index: number, color: string) => {
        const newColors = [...customColors];
        newColors[index] = color;
        setCustomColors(newColors);
    };
    
    const handleRemoveColor = (index: number) => {
        setCustomColors(customColors.filter((_, i) => i !== index));
    };

    const handleSavePalette = () => {
        if (!newPaletteName || customColors.length === 0) {
            setError("Para salvar uma paleta, forneça um nome e escolha ao menos uma cor.");
            return;
        }
        const newSavedPalettes = { ...savedPalettes, [newPaletteName]: customColors };
        setSavedPalettes(newSavedPalettes);
        localStorage.setItem('custom-palettes', JSON.stringify(newSavedPalettes));
        setNewPaletteName('');
        setSelectedPalette(newPaletteName);
        setError('');
    };

    const handleModify = useCallback(async () => {
        const hasModification = request || selectedPalette || removeText || customColors.length > 0;
        if (!originalPrompt || !hasModification) {
            setError('É necessário um prompt original e uma solicitação de alteração (texto, paleta ou remoção de texto).');
            return;
        }
        setLoading(true);
        setError('');
        setAlteredPrompt('');
        setGeneratedImages([]);
        try {
            let modificationRequest = request;
            
            if (customColors.length > 0) {
                 modificationRequest += `\n- Use a color palette with these specific colors: ${customColors.join(', ')}.`;
            } else if (selectedPalette && PREDEFINED_PALETTES[selectedPalette]) {
                modificationRequest += `\n- Use a color palette of: ${selectedPalette}.`;
            }

            if (removeText) {
                modificationRequest += `\n- The final image must not contain any text, words, or letters. Generate only the art.`;
            }

            const prompt = `Você é um engenheiro de prompt especialista. Modifique o "Prompt Original" com base na "Solicitação de Alteração". Mantenha o formato detalhado e otimizado para geração de imagem.
            ---
            Prompt Original: "${originalPrompt}"
            ---
            Solicitação de Alteração: "${modificationRequest}"
            ---
            Sua saída deve ser apenas o novo prompt modificado em inglês.`;
            const result = await geminiService.generateText(prompt);
            setAlteredPrompt(result);
            setModifiedPrompt(result);
        } catch (err) {
            setError("Falha ao alterar o prompt.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [originalPrompt, request, setModifiedPrompt, selectedPalette, removeText, customColors]);

    const handleGenerateImage = useCallback(async (config: ImageGenerationConfig) => {
        if (!alteredPrompt) return;
        setImageLoading(true);
        setError('');
        setGeneratedImages([]);
        try {
            const fullPrompt = `${alteredPrompt}, ${config.quality}, cinematic, photo realistic --ar ${config.aspectRatio}`;
            const imageUrls = await geminiService.generateImage(fullPrompt, config.variations);
            setGeneratedImages(imageUrls);
        } catch (err) {
            setError("Falha ao gerar a imagem.");
            console.error(err);
        } finally {
            setImageLoading(false);
        }
    }, [alteredPrompt]);

    if (!originalPrompt) {
        return (
            <Card>
                <CardHeader title="Altere o Prompt de Design" description="Gere um prompt na seção 'Análise de Design' primeiro." />
                <div className="text-center py-10 text-gray-500">
                    <p>Aguardando um prompt de design original para modificar.</p>
                </div>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader title="Altere o Prompt de Design" description="Descreva as modificações desejadas para o prompt de design gerado." />
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt de Design Original</label>
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                    <p className="text-gray-600 text-sm">{originalPrompt}</p>
                </div>
            </div>

            <Textarea
                label="Sua solicitação de alteração (texto ou voz):"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                rows={4}
                showSpeechButton={true}
                placeholder="Ex: Mude a paleta de cores para tons de azul, adicione um elemento de sol..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mt-4">
                <div className="space-y-2">
                    <Select
                        label="Paleta de Cores"
                        value={selectedPalette}
                        onChange={handlePaletteSelectionChange}
                    >
                        <option value="">Padrão do prompt</option>
                        <optgroup label="Predefinidas">
                            {Object.entries(PREDEFINED_PALETTES).map(([value, name]) => 
                                <option key={value} value={value}>{name}</option>
                            )}
                        </optgroup>
                        {Object.keys(savedPalettes).length > 0 && (
                            <optgroup label="Salvas">
                                {Object.keys(savedPalettes).map(name =>
                                    <option key={name} value={name}>{name}</option>
                                )}
                            </optgroup>
                        )}
                    </Select>
                    <Button variant="secondary" size="sm" onClick={() => setShowPaletteCreator(!showPaletteCreator)}>
                        Criar/Editar Paleta Customizada
                    </Button>
                </div>
                <div className="flex items-end pb-2">
                    <div className="flex items-center h-full">
                        <input
                            id="removeText"
                            type="checkbox"
                            checked={removeText}
                            onChange={e => setRemoveText(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="removeText" className="ml-2 block text-sm text-gray-700">
                            Remover todos os textos da arte
                        </label>
                    </div>
                </div>

                {showPaletteCreator && (
                     <div className="md:col-span-2 p-4 border border-gray-200 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-800">Paleta Customizada</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                            {customColors.map((color, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <input type="color" value={color} onChange={e => handleColorChange(index, e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer" />
                                    <button onClick={() => handleRemoveColor(index)} className="text-red-500 hover:text-red-700 text-xl">&times;</button>
                                </div>
                            ))}
                             <Button onClick={handleAddColor} size="sm" variant="ghost">+</Button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input label="Nome do Preset" value={newPaletteName} onChange={e => setNewPaletteName(e.target.value)} placeholder="Ex: Minha Paleta Azul" />
                            <div className="flex items-end">
                                <Button onClick={handleSavePalette} className="w-full sm:w-auto">Salvar Preset</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Button onClick={handleModify} isLoading={loading} className="mt-6">Alterar Prompt de Design</Button>

            <ResultDisplay
                label="Prompt de Design Alterado"
                content={alteredPrompt}
                imageContents={generatedImages}
                isLoading={loading}
                isImageLoading={imageLoading}
            />
             {alteredPrompt && !loading && (
                 <ImageGenerationPanel
                    prompt={alteredPrompt}
                    isGenerating={imageLoading}
                    onGenerate={handleGenerateImage}
                />
            )}
        </Card>
    );
};