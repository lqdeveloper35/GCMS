import React, { useState, useCallback } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CustomerData, SchedulePost, PostTone, CustomerStatus } from '../../types';
import * as geminiService from '../../services/geminiService';
import { CopyIcon } from '../icons/CopyIcon';
import { DownloadIcon } from '../icons/DownloadIcon';

// A dummy save icon, defined before use
const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export const AnnualContentPlanner: React.FC = () => {
    const [crmInput, setCrmInput] = useState('');
    const [formData, setFormData] = useState<CustomerData>({
        companyName: '', contactName: '', phone: '', email: '', website: '', address: '',
        firstContactDate: '', freeConsultationDate: '', freeConsultationTime: '', secondMeetingDate: '',
        secondMeetingTime: '', contractStartDate: '', contractLength: '', status: '', lastContact: '', notes: ''
    });
    const [config, setConfig] = useState({
        niche: '',
        targetAudience: '',
        postTone: PostTone.INFORMATIVO,
        postsPerWeek: 3,
        durationMonths: 1,
        startDate: new Date().toISOString().split('T')[0],
        otherInfo: ''
    });
    const [schedule, setSchedule] = useState<SchedulePost[]>([]);
    const [loading, setLoading] = useState({ crm: false, niche: false, schedule: false });
    const [error, setError] = useState('');

    const handleFormChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => 
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFillCrm = useCallback(async () => {
        if (!crmInput) return;
        setLoading(prev => ({ ...prev, crm: true }));
        setError('');
        try {
            const prompt = `Você é um assistente de análise de dados. Analise a seguinte linha de dados de um CRM e extraia as informações para um objeto JSON com as chaves: companyName, contactName, phone, email, website, address, firstContactDate, freeConsultationDate, freeConsultationTime, secondMeetingDate, secondMeetingTime, contractStartDate, contractLength, status, lastContact, notes. Se um campo não for encontrado, use uma string vazia. Dados: "${crmInput}"`;
            const result = await geminiService.generateText(prompt, true);
            const parsedData: Partial<CustomerData> = JSON.parse(result);
            setFormData(prev => ({ ...prev, ...parsedData }));
        } catch (err) {
            setError("Falha ao processar dados do CRM. Verifique o formato.");
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, crm: false }));
        }
    }, [crmInput]);

    const handleFillNiche = useCallback(async () => {
        const info = formData.companyName || formData.website;
        if (!info) return;
        setLoading(prev => ({ ...prev, niche: true }));
        setError('');
        try {
            const prompt = `Com base no nome da empresa "${formData.companyName}" e no site "${formData.website}", infira e retorne um objeto JSON com duas chaves: "niche" (Nicho de Atuação) e "targetAudience" (Público Alvo).`;
            const result = await geminiService.generateText(prompt, true);
            const parsedData = JSON.parse(result);
            setConfig(prev => ({ ...prev, ...parsedData }));
        } catch (err) {
            setError("Falha ao inferir nicho e público alvo.");
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, niche: false }));
        }
    }, [formData.companyName, formData.website]);

    const handleGenerateSchedule = useCallback(async () => {
        setLoading(prev => ({ ...prev, schedule: true }));
        setError('');
        setSchedule([]);
        try {
            const prompt = `Você é um planejador de conteúdo de mídia social especialista. Crie um cronograma de conteúdo para um cliente.
            - Informações do cliente: ${JSON.stringify(formData)}
            - Nicho: ${config.niche}
            - Público Alvo: ${config.targetAudience}
            - Tom da postagem: ${config.postTone}
            - Frequência: ${config.postsPerWeek} posts por semana
            - Duração: ${config.durationMonths} meses
            - Data de início: ${config.startDate}
            - Outras informações: ${config.otherInfo}
            Gere uma resposta como um array JSON de objetos. Cada objeto representa um post e deve ter as chaves: "week", "publicationDate", "dayOfWeek", "title", "description", "tags", "captions", "postType", "topic", "creativeSuggestion". As datas devem ser sequenciais.`;

            const result = await geminiService.generateText(prompt, true);
            const parsedData = JSON.parse(result);

            let finalSchedule: SchedulePost[] = [];
            if (Array.isArray(parsedData)) {
                // It's an array, filter out any non-object items just in case
                finalSchedule = parsedData.filter(item => typeof item === 'object' && item !== null);
            } else if (typeof parsedData === 'object' && parsedData !== null) {
                // It's a single object, wrap it in an array
                finalSchedule = [parsedData];
            } else {
                // The result is not in the expected format (e.g., it's null, a string, a number)
                console.warn("Parsed schedule from API is not a valid object or array:", parsedData);
                throw new Error("A resposta da IA não estava no formato de cronograma esperado.");
            }

            setSchedule(finalSchedule);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Falha ao gerar o cronograma.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
        }
    }, [formData, config]);

    const copySchedule = () => {
        navigator.clipboard.writeText(JSON.stringify(schedule, null, 2));
    };

    const exportToXLSX = () => {
        if (schedule.length === 0) return;
        const headers = Object.keys(schedule[0]).join(',');
        const rows = schedule.map(row => 
            Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
        );
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "cronograma_conteudo.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader title="Programador de Conteúdo Anual (CRM)" description="Preencha os dados do cliente para gerar um cronograma de conteúdo personalizado." />

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <div className="space-y-6">
                <div>
                    <Textarea label="Cole a linha de dados do cliente do CRM aqui:" value={crmInput} onChange={(e) => setCrmInput(e.target.value)} rows={3} />
                    <Button onClick={handleFillCrm} isLoading={loading.crm} className="mt-2">Preencher Dados do CRM</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input label="Nome do Cliente" name="companyName" value={formData.companyName} onChange={handleFormChange(setFormData)} />
                    <Input label="Telefone" name="phone" value={formData.phone} onChange={handleFormChange(setFormData)} />
                    <Input label="Site" name="website" value={formData.website} onChange={handleFormChange(setFormData)} />
                    <Input label="Data de Cadastro/Início" name="contractStartDate" type="date" value={formData.contractStartDate} onChange={handleFormChange(setFormData)} />
                    <Input label="Nicho de Atuação" name="niche" value={config.niche} onChange={handleFormChange(setConfig)} />
                    <Input label="Público Alvo" name="targetAudience" value={config.targetAudience} onChange={handleFormChange(setConfig)} />
                </div>
                 <Button onClick={handleFillNiche} isLoading={loading.niche} variant="secondary">Preencher Nicho e Público Alvo (IA)</Button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Select label="Tom da Postagem (para IA)" name="postTone" value={config.postTone} onChange={handleFormChange(setConfig)}>
                        {Object.values(PostTone).map(tone => <option key={tone} value={tone}>{tone}</option>)}
                    </Select>
                    <Select label="Status" name="status" value={formData.status} onChange={handleFormChange(setFormData)}>
                         {Object.values(CustomerStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </Select>
                     <Input label="Posts por Semana" name="postsPerWeek" type="number" min="1" max="7" value={config.postsPerWeek} onChange={handleFormChange(setConfig)} />
                    <Input label="Duração (Meses)" name="durationMonths" type="number" min="1" max="12" value={config.durationMonths} onChange={handleFormChange(setConfig)} />
                    <Input label="Data de Início (Primeiro Post)" name="startDate" type="date" value={config.startDate} onChange={handleFormChange(setConfig)} />
                </div>
                 <Textarea label="Outras Informações Relevantes (para o programador)" name="otherInfo" value={config.otherInfo} onChange={handleFormChange(setConfig)} rows={4} />
                 
                 <Button onClick={handleGenerateSchedule} isLoading={loading.schedule} className="w-full sm:w-auto">Gerar Cronograma de Conteúdo</Button>
            </div>

            {loading.schedule && <div className="mt-6 text-center">Gerando cronograma...</div>}
            
            {schedule.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Cronograma de Conteúdo Gerado</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Button onClick={copySchedule} variant="secondary"><CopyIcon className="w-4 h-4 mr-2" /> Copiar (JSON)</Button>
                        <Button onClick={exportToXLSX} variant="secondary"><DownloadIcon className="w-4 h-4 mr-2" /> Exportar para XLSX</Button>
                        <Button variant="secondary" disabled={true} title="Funcionalidade futura (integração com Firebase)"><SaveIcon className="w-4 h-4 mr-2"/> Salvar Cronograma</Button>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                <tr>
                                    {Object.keys(schedule[0]).map(key => <th key={key} scope="col" className="px-6 py-3 font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedule.map((post, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {Object.values(post).map((value, i) => <td key={i} className="px-6 py-4 whitespace-nowrap text-gray-700">{String(value)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Card>
    );
};