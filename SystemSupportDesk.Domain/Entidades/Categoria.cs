using SystemSupportDesk.Domain.Interfaces; // <--- Importante

namespace SystemSupportDesk.Domain.Entidades
{
    public class Categoria : ITenant // <--- Implementa ITenant
    {
        public int Id { get; private set; }

        // A PROPRIEDADE QUE FALTAVA
        public int EmpresaId { get; set; }

        public string Nome { get; private set; } = string.Empty;
        public string Descricao { get; private set; } = string.Empty;

        protected Categoria() { }

        // Construtor completo
        public Categoria(string nome, string descricao, int empresaId)
        {
            Nome = nome;
            Descricao = descricao;
            EmpresaId = empresaId;
        }

        // Construtor de compatibilidade (para seeds ou testes antigos)
        public Categoria(string nome, string descricao)
        {
            Nome = nome;
            Descricao = descricao;
            // EmpresaId será preenchido pelo AppDbContext automaticamente
        }
    }
}