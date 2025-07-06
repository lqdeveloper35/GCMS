import React from 'react';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    showSpeechButton?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, id, value, onChange, showSpeechButton = false, ...props }, ref) => {
        const handleSpeechResult = (transcript: string) => {
            if (onChange) {
                const event = {
                    target: { value: (value || '') + transcript }
                } as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(event);
            }
        };

        const { isListening, toggleListening, hasRecognitionSupport } = useSpeechRecognition(handleSpeechResult);

        return (
            <div className="w-full">
                {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
                <div className="relative">
                    <textarea
                        id={id}
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        {...props}
                    />
                    {showSpeechButton && hasRecognitionSupport && (
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            title={isListening ? "Parar gravação" : "Gravar áudio"}
                        >
                            <MicrophoneIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';