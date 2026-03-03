using System;
using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Domain.Entidades
{
    public class LogIA : ITenant
    {
        public int Id { get; set; }
        public int EmpresaId { get; set; } // Segurança SaaS

        public int? IdChamado { get; private set; }
        public string Acao { get; private set; } = string.Empty; // Ex: "Sugestão de Resposta", "Classificação Auto"
        public string Detalhes { get; private set; } = string.Empty; // O JSON ou texto processado
        public string? PromptEnviado { get; private set; } // O que mandamos pro GPT
        public double CustoEstimado { get; private set; } // Para controle de gastos
        public DateTime DataLog { get; private set; }

        protected LogIA() { }

        public LogIA(int empresaId, string acao, string detalhes, int? idChamado = null, string? prompt = null)
        {
            EmpresaId = empresaId;
            Acao = acao;
            Detalhes = detalhes;
            IdChamado = idChamado;
            PromptEnviado = prompt;
            DataLog = DateTime.UtcNow;
        }
    }
}