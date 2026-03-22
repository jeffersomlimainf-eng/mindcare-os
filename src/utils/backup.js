import { supabase } from '../lib/supabase';

/**
 * Utilitários para portabilidade de dados (Exportar/Importar) - Online Supabase
 */

export const exportData = async () => {
    const data = {
        _export_date: new Date().toISOString(),
        _source: 'MindCare OS Online Backup',
        tables: {}
    };

    try {
        const tablesToExport = [
            'profiles', 'patients', 'appointments', 'evolutions', 
            'finance', 'docs_laudo', 'docs_atestado', 'docs_declaracao', 
            'docs_anamnese', 'docs_encaminhamento', 'docs_tcle'
        ];

        for (const tableName of tablesToExport) {
            const { data: rows, error } = await supabase
                .from(tableName)
                .select('*');
            
            if (error) {
                console.warn(`[Export] Erro ao exportar tabela ${tableName}:`, error.message);
                data.tables[tableName] = []; 
            } else {
                data.tables[tableName] = rows;
            }
        }

        const json = JSON.stringify(data, null, 2);
        const dataAtual = new Date().toISOString().split('T')[0];
        const fileName = `backup_mindcare_online_${dataAtual}.json`;

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Arquivo de Backup MindCare',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(json);
                await writable.close();
                return true;
            } catch (err) {
                if (err.name === 'AbortError') return false;
                console.error('Erro ao salvar arquivo:', err);
            }
        }

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Erro crítico no exportData:', error);
        return false;
    }
};

export const importData = async (file) => {
    // Obsoleto / Desativado para evitar corrupção de dados Online
    return new Promise((resolve) => {
        alert('A restauração local foi desativada. Seus dados estão salvos com segurança na nuvem e são carregados automaticamente ao fazer login!');
        resolve(false);
    });
};
