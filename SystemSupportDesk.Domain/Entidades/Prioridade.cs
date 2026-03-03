namespace SystemSupportDesk.Domain.Entidades
{
    public class Prioridade
    {
        public int Id { get; private set; }
        public string Nome { get; private set; }
        public int OrdemClassificacao { get; private set; }
        public string CorExibicao { get; private set; }

        // CORREÇÃO: Inicializa tudo
        protected Prioridade()
        {
            Id = 0;
            Nome = string.Empty;
            CorExibicao = string.Empty;
        }

        public Prioridade(string nome, int ordem, string cor)
        {
            Nome = nome;
            OrdemClassificacao = ordem;
            CorExibicao = cor;
        }
    }
}