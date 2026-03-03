namespace SystemSupportDesk.Domain.Enums
{
    public enum StatusChamado
    {
        Novo,
        EmAndamento,
        Aguardando,
        Resolvido,
        Cancelado,
        EmAnaliseIA // <--- NOVO (Ticket invisível para o suporte)
    }
}