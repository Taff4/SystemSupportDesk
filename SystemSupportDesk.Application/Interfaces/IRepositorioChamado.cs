using System.Collections.Generic; // Necessário para List<>
using System.Threading.Tasks;
using SystemSupportDesk.Domain.Entidades;

namespace SystemSupportDesk.Application.Interfaces
{
    public interface IRepositorioChamado
    {
        Task AdicionarAsync(Chamado chamado);

        // ADICIONAMOS ESTA LINHA:
        Task<List<Chamado>> ObterTodosAsync();
    }
}