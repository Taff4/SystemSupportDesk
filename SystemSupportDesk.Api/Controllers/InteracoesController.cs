using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemSupportDesk.Api.Hubs;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Domain.Interfaces;
using SystemSupportDesk.Infrastructure.Persistencia;
using SystemSupportDesk.Infrastructure.Services;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InteracoesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantService _tenantService;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IAService _iaService;

        public InteracoesController(
            AppDbContext context,
            ITenantService tenantService,
            IHubContext<ChatHub> hubContext,
            IAService iaService)
        {
            _context = context;
            _tenantService = tenantService;
            _hubContext = hubContext;
            _iaService = iaService;
        }

        [HttpGet("chamado/{idChamado}")]
        public async Task<IActionResult> GetPorChamado(int idChamado)
        {
            var mensagens = await _context.Interacoes
                .Where(i => i.IdChamado == idChamado)
                .Include(i => i.Autor)
                .ThenInclude(u => u.Perfil)
                .OrderBy(i => i.DataCriacao)
                .Select(i => new
                {
                    i.Id,
                    i.Mensagem,
                    i.DataCriacao,
                    Autor = new { i.Autor.Id, i.Autor.Nome, i.Autor.Email, Perfil = i.Autor.Perfil.Nome }
                })
                .ToListAsync();

            return Ok(mensagens);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] NovaInteracaoDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var empresaId = _tenantService.GetEmpresaId();

            // 1. Salva a mensagem do USUÁRIO (Humano)
            var novaInteracao = new Interacao(dto.Mensagem, dto.IdChamado, userId, empresaId);
            _context.Interacoes.Add(novaInteracao);
            await _context.SaveChangesAsync();

            // Avisa SignalR 
            await _context.Entry(novaInteracao).Reference(x => x.Autor).LoadAsync();
            var dtoUsuario = new { id = novaInteracao.Id, mensagem = novaInteracao.Mensagem, dataCriacao = novaInteracao.DataCriacao, autor = new { id = novaInteracao.Autor.Id, nome = novaInteracao.Autor.Nome } };
            await _hubContext.Clients.Group($"Ticket-{dto.IdChamado}").SendAsync("ReceberMensagem", dtoUsuario);

            // ======================================================================
            // 🤖 GATILHO DA IA
            // ======================================================================
            if (userId != 99)
            {
                try
                {
                    // CORREÇÃO AQUI: Passamos 'userId' como segundo parâmetro
                    // Agora a IA sabe quem enviou a mensagem para decidir se responde ou não
                    var respostaTexto = await _iaService.GerarRespostaIA(dto.IdChamado, userId);

                    if (!string.IsNullOrEmpty(respostaTexto))
                    {
                        // Salva a resposta com ID 99 (Kovia AI)
                        var msgIA = new Interacao(respostaTexto, dto.IdChamado, 99, empresaId);
                        _context.Interacoes.Add(msgIA);
                        await _context.SaveChangesAsync();

                        var dtoIA = new
                        {
                            id = msgIA.Id,
                            mensagem = msgIA.Mensagem,
                            dataCriacao = msgIA.DataCriacao,
                            autor = new { id = 99, nome = "Kovia AI" }
                        };

                        await _hubContext.Clients.Group($"Ticket-{dto.IdChamado}").SendAsync("ReceberMensagem", dtoIA);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"🔴 [ERRO FATAL IA]: {ex.Message}");
                }
            }

            return Ok(dtoUsuario);
        }
    }

    public record NovaInteracaoDto(int IdChamado, string Mensagem);
}