using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemSupportDesk.Application.DTOs;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Domain.Interfaces; // <--- Importante
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ITenantService _tenantService; // <--- Novo

        public UsuariosController(AppDbContext context, IWebHostEnvironment env, ITenantService tenantService)
        {
            _context = context;
            _env = env;
            _tenantService = tenantService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr == null) return Unauthorized();

            var userId = int.Parse(userIdStr);
            var usuario = await _context.Usuarios.FindAsync(userId);

            if (usuario == null) return NotFound();

            return Ok(new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email,
                usuario.Telefone,
                usuario.FotoUrl,
                usuario.Cargo,
                // usuario.Empresa -> Removido pois agora é ID. O front pega isso do token ou outro endpoint
                EmpresaId = usuario.EmpresaId,
                usuario.IdPerfil,
                usuario.LinkedIn,
                usuario.Bio
            });
        }

        // ... (DTOs e método AtualizarPerfil mantidos iguais, pois Usuario.cs foi corrigido na etapa anterior) ...
        // Vou omitir AtualizarPerfil para economizar espaço, mantenha o seu mas garanta que Usuario.cs tenha AtualizarPerfil

        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            // O AppDbContext já filtra só usuários da MINHA empresa
            var usuarios = await _context.Usuarios
                .Include(u => u.Perfil)
                .Select(u => new
                {
                    u.Id,
                    u.Nome,
                    u.Email,
                    u.Cargo,
                    // u.Empresa -> Removido
                    u.Telefone,
                    u.FotoUrl,
                    Perfil = u.Perfil.Nome
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<IActionResult> PostUsuario([FromBody] CriarUsuarioDto dto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Este e-mail já está cadastrado.");

            var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.Nome == dto.Perfil);
            if (perfil == null)
            {
                // Fallback simples
                perfil = await _context.Perfis.FindAsync(4); // Solicitante
            }

            // Pega a empresa de quem está criando o usuário (Admin)
            var empresaId = _tenantService.GetEmpresaId();

            var novoUsuario = new Usuario(
                dto.Nome,
                dto.Email,
                "123456", // Senha temporária
                perfil!.Id,
                dto.Cargo,
                empresaId // <--- Passa o ID aqui
            );

            _context.Usuarios.Add(novoUsuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsuarios), new { id = novoUsuario.Id }, new
            {
                novoUsuario.Id,
                novoUsuario.Nome,
                novoUsuario.Email
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound("Usuário não encontrado.");

            // O filtro global já impede deletar usuario de outra empresa, mas validamos se é ele mesmo
            // if (usuario.Id == currentUserId) return BadRequest("Não se suicide digitalmente.");

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}