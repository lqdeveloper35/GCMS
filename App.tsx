
import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { AnnualContentPlanner } from './components/sections/AnnualContentPlanner';
import { DesignAnalysis } from './components/sections/DesignAnalysis';
import { ModifyPrompt } from './components/sections/ModifyPrompt';
import { ContentAnalysis } from './components/sections/ContentAnalysis';
import { MergePrompts } from './components/sections/MergePrompts';
import { CarouselPromptGenerator } from './components/sections/CarouselPromptGenerator';
import { ArtEditor } from './components/sections/ArtEditor';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';
import { Section, SECTIONS } from './constants';

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('planner');
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [designPrompt, setDesignPrompt] = useState<string>('');
    const [modifiedDesignPrompt, setModifiedDesignPrompt] = useState<string>('');
    const [contentPrompt, setContentPrompt] = useState<string>('');
    const [mergedPrompt, setMergedPrompt] = useState<string>('');
    
    const isSectionDisabled = (sectionId: Section) => {
        switch (sectionId) {
            case 'modify': return !designPrompt;
            case 'merge': return !(modifiedDesignPrompt || designPrompt) || !contentPrompt;
            default: return false;
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'planner':
                return <AnnualContentPlanner />;
            case 'design':
                return <DesignAnalysis setDesignPrompt={setDesignPrompt} />;
            case 'modify':
                return <ModifyPrompt originalPrompt={designPrompt} setModifiedPrompt={setModifiedDesignPrompt} />;
            case 'content':
                return <ContentAnalysis setContentPrompt={setContentPrompt} />;
            case 'merge':
                return <MergePrompts designPrompt={modifiedDesignPrompt || designPrompt} contentPrompt={contentPrompt} setMergedPrompt={setMergedPrompt} />;
            case 'carousel':
                return <CarouselPromptGenerator />;
            case 'editor':
                return <ArtEditor />;
            default:
                return null;
        }
    };
    
    const activeSectionName = SECTIONS.find(s => s.id === activeSection)?.name || 'Dashboard';

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isCollapsed={isSidebarCollapsed}
              toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
              isSectionDisabled={isSectionDisabled}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                        {activeSectionName}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <BrainCircuitIcon className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                        <footer className="text-center mt-12 text-gray-500 text-sm">
                            <p>Powered by Gemini API</p>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;