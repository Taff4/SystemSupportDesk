using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SystemSupportDesk.Application.DTOs;
using SystemSupportDesk.Application.Interfaces;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Application.Servicos
{
    public class ChamadoService
    {
        private readonly IRepositorioChamado _repositorio;
        private readonly ITenantService _tenantService;

        public ChamadoService(IRepositorioChamado repositorio, ITenantService tenantService)
        {
            _repositorio = repositorio;
            _tenantService = tenantService;
        }

        // Método padrão (Via Formulário)
        public async Task<Chamado> AbrirNovoChamadoAsync(CriarChamadoRequestDto dto, int idAutor)
        {
            var empresaId = _tenantService.GetEmpresaId();

            var novoChamado = new Chamado(
                dto.Titulo,
                dto.Descricao,
                dto.IdCategoria,
                dto.IdPrioridade,
                idAutor,
                empresaId
            );

            await _repositorio.AdicionarAsync(novoChamado);
            return novoChamado;
        }

        // === NOVO MÉTODO (CHAT-FIRST) ===
        // Cria um ticket "invisível" para iniciar a conversa com a IA
        public async Task<Chamado> IniciarChatInteligente(int idAutor, string primeiraMensagem)
        {
            var empresaId = _tenantService.GetEmpresaId();

            // Cria o chamado (Padrão: Categoria 1/Geral, Prioridade 2/Média)
            // Ajuste os IDs conforme seus seeds (Hardware=1, Média=2)
            var novoChamado = new Chamado(
                "Atendimento via Chat", // Título provisório
                primeiraMensagem,
                1, // ID Categoria Padrão
                2, // ID Prioridade Padrão
                idAutor,
                empresaId,
                "Chatbot"
            );

            // Tenta mudar o status para EmAnaliseIA (se o método existir na entidade)
            // Se você ainda não criou o método na entidade, pode comentar a linha abaixo temporariamente,
            // mas o ticket aparecerá na fila imediatamente.
            // novoChamado.DefinirStatusAnaliseIA(); 

            await _repositorio.AdicionarAsync(novoChamado);
            return novoChamado;
        }

        public async Task<IEnumerable<Chamado>> ListarTodosAsync(int? idUsuarioFiltro = null)
        {
            var todos = await _repositorio.ObterTodosAsync();

            if (idUsuarioFiltro.HasValue)
            {
                return todos.Where(c => c.IdAutor == idUsuarioFiltro.Value);
            }
            return todos;
        }
    }
}