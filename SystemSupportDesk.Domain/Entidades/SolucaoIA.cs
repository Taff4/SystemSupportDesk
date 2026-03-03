using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Domain.Entidades
{
    public class SolucaoIA : ITenant
    {
        public int Id { get; set; }
        public int EmpresaId { get; set; }

        public string ProblemaResumido { get; private set; } = string.Empty;
        public string SolucaoDetalhada { get; private set; } = string.Empty;

        // Palavras-chave para busca rápida antes de chamar o GPT (economiza tokens)
        public string Tags { get; private set; } = string.Empty;

        public int VezesUtilizada { get; private set; }
        public double IndiceConfianca { get; private set; } // 0.0 a 1.0

        protected SolucaoIA() { }

        public SolucaoIA(string problema, string solucao, string tags, int empresaId)
        {
            ProblemaResumido = problema;
            SolucaoDetalhada = solucao;
            Tags = tags;
            EmpresaId = empresaId;
            VezesUtilizada = 0;
            IndiceConfianca = 1.0; // Começa alto se foi criada por humano
        }

        public void IncrementarUso() => VezesUtilizada++;
    }
}