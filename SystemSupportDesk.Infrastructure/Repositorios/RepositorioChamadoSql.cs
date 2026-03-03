using Microsoft.EntityFrameworkCore; // Necessário para ToListAsync e Include
using System.Collections.Generic;
using System.Threading.Tasks;
using SystemSupportDesk.Application.Interfaces;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Infrastructure.Repositorios
{
    public class RepositorioChamadoSql : IRepositorioChamado
    {
        private readonly AppDbContext _context;

        public RepositorioChamadoSql(AppDbContext context)
        {
            _context = context;
        }

        public async Task AdicionarAsync(Chamado chamado)
        {
            await _context.Chamados.AddAsync(chamado);
            await _context.SaveChangesAsync();
        }

        // IMPLEMENTAÇÃO DO NOVO MÉTODO
        public async Task<List<Chamado>> ObterTodosAsync()
        {
            return await _context.Chamados
                .Include(c => c.Categoria)   // Traz o nome da Categoria
                .Include(c => c.Prioridade)  // Traz o nome e a cor da Prioridade
                .ToListAsync();
        }
    }
}