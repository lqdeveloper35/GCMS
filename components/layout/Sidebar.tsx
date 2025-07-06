
import React from 'react';
import { Section, SECTIONS } from '../../constants';
import { CalendarIcon } from '../icons/CalendarIcon';
import { PaletteIcon } from '../icons/PaletteIcon';
import { WandIcon } from '../icons/WandIcon';
import { ContentAnalysisIcon } from '../icons/ContentAnalysisIcon';
import { MergeIcon } from '../icons/MergeIcon';
import { LayersIcon } from '../icons/LayersIcon';
import { CropIcon } from '../icons/CropIcon';
import { MenuIcon } from '../icons/MenuIcon';
import { BrainCircuitIcon } from '../icons/BrainCircuitIcon';

interface SidebarProps {
    activeSection: Section;
    setActiveSection: (section: Section) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isSectionDisabled: (sectionId: Section) => boolean;
}

const ICONS: { [key in Section]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    planner: CalendarIcon,
    design: PaletteIcon,
    modify: WandIcon,
    content: ContentAnalysisIcon,
    merge: MergeIcon,
    carousel: LayersIcon,
    editor: CropIcon,
};

export const Sidebar: React.FC<SidebarProps> = ({
    activeSection,
    setActiveSection,
    isCollapsed,
    toggleCollapse,
    isSectionDisabled,
}) => {
    return (
        <div className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-width duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center justify-between h-[65px] border-b border-gray-200 px-4">
                {!isCollapsed && (
                     <div className="flex items-center gap-2">
                         <BrainCircuitIcon className="h-8 w-8 text-blue-600" />
                         <span className="font-bold text-lg text-gray-800">Criador IA</span>
                    </div>
                )}
                 <button onClick={toggleCollapse} className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                    <MenuIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {SECTIONS.map(section => {
                    const Icon = ICONS[section.id];
                    const isDisabled = isSectionDisabled(section.id);
                    return (
                        <button
                            key={section.id}
                            title={isCollapsed ? section.name : ''}
                            disabled={isDisabled}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center p-3 rounded-md transition-colors text-sm font-medium
                                ${isCollapsed ? 'justify-center' : ''}
                                ${activeSection === section.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <Icon className="h-6 w-6" />
                            {!isCollapsed && <span className="ml-3">{section.name}</span>}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};