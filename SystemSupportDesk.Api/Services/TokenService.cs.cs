using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SystemSupportDesk.Domain.Entidades;

namespace SystemSupportDesk.Api.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GerarToken(Usuario usuario)
        {
            // O erro de BinaryReader geralmente é chave nula. O operador ?? resolve.
            var jwtKey = _configuration["Jwt:Key"] ?? throw new Exception("Jwt:Key não configurada");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim(ClaimTypes.Role, usuario.Perfil.Nome),

                // CORREÇÃO: Usamos EmpresaId agora. 
                // O Front vai precisar buscar o nome da empresa em outro lugar ou você faz um Join antes.
                new Claim("EmpresaId", usuario.EmpresaId.ToString()),

                new Claim("Cargo", usuario.Cargo ?? ""),
                new Claim("Telefone", usuario.Telefone ?? ""),
                new Claim("LinkedIn", usuario.LinkedIn ?? ""),
                new Claim("Bio", usuario.Bio ?? ""),
                new Claim("FotoUrl", usuario.FotoUrl ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}