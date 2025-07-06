import React, { useEffect, useRef, useState } from 'react';
import ImageEditor from 'tui-image-editor';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ImageUploader } from '../ui/ImageUploader';
import * as geminiService from '../../services/geminiService';

const whiteTheme = {
    'common.bi.image': '',
    'common.bisize.width': '0px',
    'common.bisize.height': '0px',
    'common.backgroundImage': 'none',
    'common.backgroundColor': '#f3f4f6',
    'common.border': '1px solid #e5e7eb',
    'header.backgroundImage': 'none',
    'header.backgroundColor': 'transparent',
    'header.border': '0px',
    'loadButton.backgroundColor': '#fff',
    'loadButton.border': '1px solid #ddd',
    'loadButton.color': '#222',
    'downloadButton.backgroundColor': '#1A73E8',
    'downloadButton.border': '1px solid #1A73E8',
    'downloadButton.color': '#fff',
    'menu.normalIcon.color': '#555',
    'menu.activeIcon.color': '#1A73E8',
    'menu.disabledIcon.color': '#ccc',
    'menu.hoverIcon.color': '#1A73E8',
    'submenu.normalIcon.color': '#555',
    'submenu.activeIcon.color': '#1A73E8',
    'checkbox.border': '1px solid #ccc',
    'checkbox.backgroundColor': '#fff',
    'range.pointer.color': '#1A73E8',
    'range.bar.color': '#ccc',
    'range.subbar.color': '#1A73E8',
    'range.value.color': '#333',
    'range.title.color': '#333',
    'colorpicker.button.border': '0px',
    'colorpicker.title.color': '#333'
};

export const ArtEditor: React.FC = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const imageEditorInstance = useRef<ImageEditor | null>(null);
    const [prompt, setPrompt] = useState('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!editorRef.current) return;
        
        // Destroy the old instance if it exists
        imageEditorInstance.current?.destroy();

        // Create a new instance with the correct theme
        imageEditorInstance.current = new ImageEditor(editorRef.current, {
            includeUI: {
                loadImage: {
                    path: '',
                    name: 'Blank',
                },
                menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
                initMenu: 'filter',
                uiSize: {
                    width: '100%',
                    height: '700px',
                },
                menuBarPosition: 'bottom',
                theme: whiteTheme,
            },
            cssMaxWidth: 900,
            cssMaxHeight: 700,
            usageStatistics: false,
        });

    }, []);

    const handleImageUpload = (file: File | null) => {
        if (file) {
            setUploadedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                if (imageEditorInstance.current) {
                    // Using `loadImageFromFile` is more reliable for TUI Editor
                    imageEditorInstance.current.loadImageFromFile(file).catch(err => {
                         setError('Falha ao carregar a imagem no editor.');
                         console.error(err);
                    });
                }
            };
            reader.readAsDataURL(file);
        } else {
            setUploadedImage(null);
            setImagePreview(null);
        }
    };
    
    const handleGenerateAndLoad = async () => {
        if(!prompt) return;
        setLoading(true);
        setError('');
        try {
            const imageUrls = await geminiService.generateImage(prompt, 1);
            if (imageEditorInstance.current && imageUrls[0]) {
                // To avoid CORS issues, fetch the image data and create a blob
                const response = await fetch(imageUrls[0]);
                const blob = await response.blob();
                const file = new File([blob], "generated-image.jpg", { type: "image/jpeg" });

                imageEditorInstance.current.loadImageFromFile(file).catch(err => {
                    setError('Falha ao carregar a imagem gerada no editor.');
                    console.error(err);
                });
            }
        } catch(err) {
            setError("Falha ao gerar e carregar imagem.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader title="Edição da Arte Criada" description="Edite imagens geradas por IA ou envie as suas próprias para edição." />
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <Textarea
                        label="Cole o prompt da imagem que deseja editar aqui:"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="Cole um prompt de uma das seções anteriores..."
                    />
                    <Button onClick={handleGenerateAndLoad} isLoading={loading} className="mt-2" disabled={!prompt}>Gerar e Carregar Imagem</Button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ou envie uma imagem:</label>
                    <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} />
                </div>
            </div>
            
            <div id="tui-image-editor-container" ref={editorRef} style={{height: '700px', width: '100%'}}></div>
        </Card>
    );
};