namespace SystemSupportDesk.Application.DTOs
{
    public class CriarUsuarioDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Cargo { get; set; } = string.Empty;
        public string Empresa { get; set; } = string.Empty; // <--- NOVO
        public string Perfil { get; set; } = string.Empty;
    }
}