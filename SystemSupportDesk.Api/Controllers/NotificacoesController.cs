using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificacoesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMinhasNotificacoes()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr == null) return Unauthorized();
            var userId = int.Parse(userIdStr);

            // 1. Verifica se precisa criar notificações iniciais (Seed)
            var temNotificacoes = await _context.Notificacoes
                .IgnoreQueryFilters()
                .AnyAsync(n => n.UsuarioId == userId);

            if (!temNotificacoes)
            {
                // Busca usuário ignorando filtro (para garantir que achamos mesmo se o tenant falhar)
                var user = await _context.Usuarios
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user != null)
                {
                    var empresaId = user.EmpresaId;

                    // Criação usando Object Initializer (Mais seguro que construtor)
                    var iniciais = new List<Notificacao>
                    {
                        new Notificacao { UsuarioId = userId, EmpresaId = empresaId, Titulo = "Bem-vindo!", Mensagem = $"Olá {user.Nome}.", Tipo = "success", DataCriacao = DateTime.UtcNow },
                        new Notificacao { UsuarioId = userId, EmpresaId = empresaId, Titulo = "IA Ativa", Mensagem = "Monitoramento iniciado.", Tipo = "ai", LinkAction = "analises", DataCriacao = DateTime.UtcNow },
                        new Notificacao { UsuarioId = userId, EmpresaId = empresaId, Titulo = "SLA", Mensagem = "Fique atento aos prazos.", Tipo = "warning", LinkAction = "tickets", DataCriacao = DateTime.UtcNow }
                    };

                    _context.Notificacoes.AddRange(iniciais);
                    await _context.SaveChangesAsync();
                }
            }

            // 2. Retorna lista filtrada
            var lista = await _context.Notificacoes
                .Where(n => n.UsuarioId == userId)
                .OrderByDescending(n => n.DataCriacao)
                .Take(20)
                .ToListAsync();

            return Ok(lista);
        }

        [HttpPost("ler/{id}")]
        public async Task<IActionResult> MarcarComoLida(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // O filtro global garante que só leio notificações da minha empresa
            var notif = await _context.Notificacoes
                .FirstOrDefaultAsync(n => n.Id == id && n.UsuarioId == userId);

            if (notif == null) return NotFound();

            notif.MarcarComoLida();
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("ler-todas")]
        public async Task<IActionResult> MarcarTodasComoLidas()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var naoLidas = await _context.Notificacoes
                .Where(n => n.UsuarioId == userId && !n.Lida)
                .ToListAsync();

            foreach (var n in naoLidas) n.MarcarComoLida();

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}