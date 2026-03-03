using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemSupportDesk.Domain.Enums;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = int.Parse(userIdStr);
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // O APPCONTEXT JÁ FILTRA TUDO PELO EMPRESAID AUTOMATICAMENTE.
            // Não precisamos mais fazer "Where(c => c.EmpresaId == ...)"

            // 1. VISÃO DO SOLICITANTE
            if (role == "Solicitante")
            {
                var meusTickets = await _context.Chamados
                    .Where(c => c.IdAutor == userId)
                    .ToListAsync();

                return Ok(new
                {
                    totalAbertos = meusTickets.Count(c => c.Status != StatusChamado.Resolvido && c.Status != StatusChamado.Cancelado),
                    totalResolvidos = meusTickets.Count(c => c.Status == StatusChamado.Resolvido),
                    ultimosTickets = meusTickets.OrderByDescending(c => c.DataAbertura).Take(3)
                        .Select(t => new { t.Id, t.Titulo, Status = t.Status.ToString(), Data = t.DataAbertura })
                });
            }

            // 2. VISÃO DO ANALISTA
            if (role == "Analista")
            {
                var meusAtendimentos = await _context.Chamados
                    .Where(c => c.IdResponsavel == userId)
                    .ToListAsync();

                var slaRisco = await _context.Chamados
                    .CountAsync(c => c.IdResponsavel == userId &&
                                     c.Status != StatusChamado.Resolvido &&
                                     c.IdPrioridade == 1);

                return Ok(new
                {
                    minhaFila = meusAtendimentos.Count(c => c.Status == StatusChamado.EmAndamento || c.Status == StatusChamado.Novo),
                    resolvidosHoje = meusAtendimentos.Count(c => c.Status == StatusChamado.Resolvido && c.DataEncerramento?.Date == DateTime.UtcNow.Date),
                    slaRisco = slaRisco,
                    ticketsPendentes = await _context.Chamados
                        .Where(c => c.Status == StatusChamado.EmAndamento)
                        .Take(5)
                        .Select(t => new { t.Id, t.Titulo, t.IdPrioridade })
                        .ToListAsync()
                });
            }

            // 3. VISÃO DO ADMINISTRADOR
            if (role == "Administrador")
            {
                // ATENÇÃO: Aqui removemos o filtro manual por string "Empresa".
                // O Global Filter garante que o Admin só veja dados da empresa dele.

                var totalTickets = await _context.Chamados.CountAsync();
                var abertos = await _context.Chamados.CountAsync(c => c.Status != StatusChamado.Resolvido);
                var criticos = await _context.Chamados.CountAsync(c => c.IdPrioridade == 1 && c.Status != StatusChamado.Resolvido);

                return Ok(new
                {
                    volumeTotal = totalTickets,
                    emAberto = abertos,
                    criticos = criticos,
                    csat = 4.8 // Mock
                });
            }

            // 4. VISÃO MESTRE (Super Admin do Sistema)
            if (role == "Mestre")
            {
                // Mestre precisa ver tudo? Se sim, usamos IgnoreQueryFilters.
                // Se não, ele vê só dados da Kovia Desk.
                // Vamos assumir que ele vê estatísticas globais:

                return Ok(new
                {
                    totalEmpresas = await _context.Usuarios.IgnoreQueryFilters().Select(u => u.EmpresaId).Distinct().CountAsync(),
                    totalUsuarios = await _context.Usuarios.IgnoreQueryFilters().CountAsync(),
                    totalTicketsSistema = await _context.Chamados.IgnoreQueryFilters().CountAsync(),
                    statusSistema = "Operacional"
                });
            }

            return BadRequest("Perfil não reconhecido");
        }
    }
}