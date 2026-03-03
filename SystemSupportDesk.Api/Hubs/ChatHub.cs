using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SystemSupportDesk.Api.Hubs
{
    [Authorize] // Obriga estar logado com Token JWT
    public class ChatHub : Hub
    {
        // O Frontend chama essa função quando entra na tela do Ticket
        public async Task EntrarNoTicket(string ticketId)
        {
            // Coloca o usuário numa "Sala" exclusiva daquele ticket
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Ticket-{ticketId}");
        }

        public async Task SairDoTicket(string ticketId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Ticket-{ticketId}");
        }
    }
}