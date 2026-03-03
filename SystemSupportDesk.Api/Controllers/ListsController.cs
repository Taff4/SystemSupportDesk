using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // <--- Importante para ativar o TenantService
    public class ListasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ListasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("categorias")]
        public async Task<IActionResult> GetCategorias()
        {
            // Se categorias forem globais (sistema todo igual), use .IgnoreQueryFilters()
            // Se cada empresa cria as suas, deixe normal.
            // Para MVP, vamos assumir globais ou filtradas, o contexto decide.
            var categorias = await _context.Categorias.ToListAsync();
            return Ok(categorias);
        }

        [HttpGet("prioridades")]
        public async Task<IActionResult> GetPrioridades()
        {
            var prioridades = await _context.Prioridades.ToListAsync();
            return Ok(prioridades);
        }
    }
}