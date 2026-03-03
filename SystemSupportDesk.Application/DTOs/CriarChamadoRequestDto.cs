namespace SystemSupportDesk.Application.DTOs
{
    public class CriarChamadoRequestDto
    {
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;

        // NOVOS CAMPOS
        public int IdCategoria { get; set; }
        public int IdPrioridade { get; set; }
    }
}