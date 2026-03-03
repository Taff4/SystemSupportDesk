// Cores padronizadas para todo o sistema
export const getStatusColor = (status: string) => {
    switch (status) {
        case 'Novo': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
        case 'EmAndamento': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
        case 'Aguardando': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
        case 'Resolvido': return 'text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
        case 'Cancelado': return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        default: return 'text-gray-500 bg-gray-100';
    }
};

export const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
        case 'Alta': return 'bg-red-500';
        case 'Média': return 'bg-yellow-500';
        case 'Baixa': return 'bg-green-500';
        default: return 'bg-gray-400';
    }
};