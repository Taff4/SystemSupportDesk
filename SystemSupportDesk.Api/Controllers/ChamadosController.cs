using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemSupportDesk.Application.DTOs;
using SystemSupportDesk.Infrastructure.Services; // Namespace do IAService
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Domain.Enums;
using SystemSupportDesk.Domain.Interfaces;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChamadosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantService _tenantService;
        private readonly IAService _iaService;

        public ChamadosController(AppDbContext context, ITenantService tenantService, IAService iaService)
        {
            _context = context;
            _tenantService = tenantService;
            _iaService = iaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetChamados()
        {
            var chamados = await _context.Chamados
                .Include(c => c.Categoria)
                .Include(c => c.Prioridade)
                .Include(c => c.Autor)
                .Include(c => c.Responsavel)
                .OrderByDescending(c => c.DataAbertura)
                .ToListAsync();

            return Ok(chamados);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetChamado(int id)
        {
            var chamado = await _context.Chamados
                .Include(c => c.Categoria)
                .Include(c => c.Prioridade)
                .Include(c => c.Autor)
                .Include(c => c.Responsavel)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (chamado == null) return NotFound();

            return Ok(chamado);
        }

        [HttpPost]
        public async Task<IActionResult> PostChamado([FromBody] CriarChamadoRequestDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var empresaId = _tenantService.GetEmpresaId();

            var chamado = new Chamado(
                dto.Titulo,
                dto.Descricao,
                dto.IdCategoria,
                dto.IdPrioridade,
                userId,
                empresaId,
                "Tecnico"
            );

            _context.Chamados.Add(chamado);
            await _context.SaveChangesAsync();

            // ========================================================
            // 🤖 IA EM AÇÃO (GOOGLE GEMINI / GROQ)
            // ========================================================
            try
            {
                // CORREÇÃO AQUI: Passamos 'userId' como segundo parâmetro
                var respostaTexto = await _iaService.GerarRespostaIA(chamado.Id, userId);

                if (!string.IsNullOrEmpty(respostaTexto))
                {
                    // 2. Salva a resposta no banco como "Kovia AI" (ID 99)
                    var msgIA = new Interacao(
                        respostaTexto,
                        chamado.Id,
                        99, // ID do Robô
                        empresaId
                    );

                    _context.Interacoes.Add(msgIA);

                    // 3. Cria o Log de Auditoria
                    var log = new LogIA(
                        empresaId,
                        "Resposta Gemini Inicial",
                        "Resposta gerada na criação do ticket",
                        chamado.Id
                    );
                    _context.LogsIA.Add(log);

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO CRÍTICO IA]: {ex.Message}");
            }

            return CreatedAtAction(nameof(GetChamado), new { id = chamado.Id }, chamado);
        }

        [HttpPatch("{id}/assumir")]
        public async Task<IActionResult> AssumirChamado(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var chamado = await _context.Chamados.FindAsync(id);

            if (chamado == null) return NotFound();

            chamado.AssumirAtendimento(userId);
            await _context.SaveChangesAsync();
            return Ok(chamado);
        }

        [HttpPatch("{id}/resolver")]
        public async Task<IActionResult> ResolverChamado(int id)
        {
            var chamado = await _context.Chamados.FindAsync(id);
            if (chamado == null) return NotFound();

            chamado.Resolver();
            await _context.SaveChangesAsync();
            return Ok(chamado);
        }

        [HttpPatch("{id}/cancelar")]
        public async Task<IActionResult> CancelarChamado(int id)
        {
            var chamado = await _context.Chamados.FindAsync(id);
            if (chamado == null) return NotFound();

            chamado.Cancelar();
            await _context.SaveChangesAsync();
            return Ok(chamado);
        }
    }
}