using System;
using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Domain.Entidades
{
    public class Interacao : ITenant // <--- Implementa ITenant
    {
        public int Id { get; set; }
        public int EmpresaId { get; set; } // <--- Nova Propriedade Obrigatória

        public string Mensagem { get; private set; } = null!;
        public DateTime DataCriacao { get; private set; }
        public string? AnexoUrl { get; private set; }
        public string? TipoAnexo { get; private set; }
        public bool EhInterno { get; private set; } = false;

        public int IdChamado { get; private set; }
        public int IdAutor { get; private set; }
        public virtual Usuario Autor { get; set; } = null!;

        protected Interacao() { }

        public Interacao(string mensagem, int idChamado, int idAutor, int empresaId, bool ehInterno = false)
        {
            Mensagem = mensagem;
            IdChamado = idChamado;
            IdAutor = idAutor;
            EmpresaId = empresaId; // <--- Recebe a empresa
            EhInterno = ehInterno;
            DataCriacao = DateTime.UtcNow;
        }
    }
}