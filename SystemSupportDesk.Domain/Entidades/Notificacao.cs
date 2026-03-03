using System;
using SystemSupportDesk.Domain.Interfaces; // <--- Importante para o ITenant

namespace SystemSupportDesk.Domain.Entidades
{
    public class Notificacao : ITenant // <--- Implementa a interface de segurança
    {
        public int Id { get; set; }

        // A PROPRIEDADE QUE ESTAVA FALTANDO E CAUSOU O ERRO
        public int EmpresaId { get; set; }

        public int UsuarioId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensagem { get; set; } = string.Empty;
        public string Tipo { get; set; } = "info"; // "info", "success", "warning", "ai"
        public bool Lida { get; set; } = false;
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public string? LinkAction { get; set; }

        public Notificacao() { }

        // Construtor utilitário para facilitar a criação (Opcional, mas ajuda)
        public Notificacao(int usuarioId, string titulo, string mensagem, string tipo, string? linkAction = null)
        {
            UsuarioId = usuarioId;
            Titulo = titulo;
            Mensagem = mensagem;
            Tipo = tipo;
            LinkAction = linkAction;
            DataCriacao = DateTime.UtcNow;
            Lida = false;
        }

        public void MarcarComoLida()
        {
            Lida = true;
        }
    }
}