using System;
using SystemSupportDesk.Domain.Enums;
using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Domain.Entidades
{
    public class Chamado : ITenant
    {
        // ================= PROPRIEDADES =================
        public int Id { get; set; }
        public int EmpresaId { get; set; } // Segurança SaaS

        public string Titulo { get; private set; } = string.Empty;
        public string Descricao { get; private set; } = string.Empty;

        public DateTime DataAbertura { get; private set; }
        public DateTime? DataEncerramento { get; private set; }
        public StatusChamado Status { get; private set; }

        public string TipoAtendimento { get; private set; } = "Tecnico";
        public int IdCategoria { get; private set; }
        public int IdPrioridade { get; private set; }
        public int IdAutor { get; private set; }
        public int? IdResponsavel { get; private set; }

        public virtual Categoria Categoria { get; set; } = null!;
        public virtual Prioridade Prioridade { get; set; } = null!;
        public virtual Usuario Autor { get; set; } = null!;
        public virtual Usuario? Responsavel { get; set; }

        // ================= CONSTRUTORES =================
        protected Chamado() { }

        public Chamado(string titulo, string descricao, int idCategoria, int idPrioridade, int idAutor, int empresaId, string tipo = "Tecnico")
        {
            Titulo = titulo;
            Descricao = descricao;
            IdCategoria = idCategoria;
            IdPrioridade = idPrioridade;
            IdAutor = idAutor;
            EmpresaId = empresaId;
            TipoAtendimento = tipo;

            DataAbertura = DateTime.UtcNow;
            Status = StatusChamado.Novo;
        }

        // ================= MÉTODOS DE NEGÓCIO =================

        public void AssumirAtendimento(int idAnalista)
        {
            IdResponsavel = idAnalista;
            Status = StatusChamado.EmAndamento;
        }

        public void Resolver()
        {
            Status = StatusChamado.Resolvido;
            DataEncerramento = DateTime.UtcNow;
        }

        public void Cancelar()
        {
            Status = StatusChamado.Cancelado;
            DataEncerramento = DateTime.UtcNow;
        }

        // === NOVO MÉTODO (NECESSÁRIO PARA O TRANSBORDO DA IA) ===
        public void EncaminharParaFila()
        {
            // Retorna o status para Novo (aparece na fila de todos)
            Status = StatusChamado.Novo;
            // Remove o responsável atual (desvincula da IA ou Analista)
            IdResponsavel = null;
        }
        public void DefinirStatusAnaliseIA()
        {
            Status = StatusChamado.EmAnaliseIA;
        }
    }
}

