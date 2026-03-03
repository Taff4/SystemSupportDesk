import axios from 'axios';

const api = axios.create({
    // CORREÇÃO 1: Porta 5090 (HTTP) conforme seu console
    // CORREÇÃO 2: Adicionado "/api" no final
    baseURL: 'http://localhost:5090/api',
    timeout: 10000 // 10 segundos
});

// INTERCEPTOR: Injeta o token em TODAS as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ssd_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Tratamento de erros de resposta (Opcional, mas ajuda a debugar)
api.interceptors.response.use(response => response, error => {
    if (error.code === "ERR_NETWORK") {
        console.error("ERRO CRÍTICO: O Frontend não alcançou o Backend em http://localhost:5090/api");
    }
    return Promise.reject(error);
});

export default api;