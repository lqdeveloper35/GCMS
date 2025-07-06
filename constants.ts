
export type Section = 'planner' | 'design' | 'modify' | 'content' | 'merge' | 'carousel' | 'editor';

export const SECTIONS: { id: Section, name: string }[] = [
    { id: 'planner', name: 'Programador de Conteúdo' },
    { id: 'design', name: 'Análise de Design' },
    { id: 'modify', name: 'Alterar Prompt de Design' },
    { id: 'content', name: 'Análise de Conteúdo' },
    { id: 'merge', name: 'Mesclar Prompts' },
    { id: 'carousel', name: 'Gerador de Carrossel' },
    { id: 'editor', name: 'Editor de Arte' },
];
