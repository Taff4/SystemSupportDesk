using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemSupportDesk.Api.Services;
using SystemSupportDesk.Application.DTOs;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            // === A CORREÇÃO ESTÁ AQUI ===
            // Usamos .IgnoreQueryFilters() porque o usuário ainda não está logado,
            // então o sistema não sabe qual é a EmpresaId dele.
            // Precisamos buscar no banco globalmente para descobrir quem ele é.

            var usuario = await _context.Usuarios
                .IgnoreQueryFilters() // <--- PULO DO GATO: Ignora a segurança SaaS apenas aqui
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (usuario == null)
                return Unauthorized("Usuário não encontrado.");

            // 2. Verifica a senha (Comparação Simples por enquanto)
            if (usuario.SenhaHash != dto.Senha)
                return Unauthorized("Senha incorreta.");

            // 3. Gera o Token (O Token vai conter o EmpresaId = 1)
            var token = _tokenService.GerarToken(usuario);

            return Ok(new
            {
                token = token,
                usuario = new
                {
                    usuario.Id,
                    usuario.Nome,
                    usuario.Email,
                    Perfil = usuario.Perfil.Nome,
                    EmpresaId = usuario.EmpresaId // Retornamos o ID agora
                }
            });
        }
    }
}