using Microsoft.EntityFrameworkCore;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Infrastructure.Persistencia
{
    public class AppDbContext : DbContext
    {
        private readonly ITenantService _tenantService;
        private readonly int _tenantId;

        public AppDbContext(DbContextOptions<AppDbContext> options, ITenantService tenantService)
            : base(options)
        {
            _tenantService = tenantService;
            _tenantId = _tenantService.GetEmpresaId();
        }

        // --- TABELAS ---
        public DbSet<Chamado> Chamados { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Perfil> Perfis { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Prioridade> Prioridades { get; set; }
        public DbSet<Interacao> Interacoes { get; set; }
        public DbSet<Notificacao> Notificacoes { get; set; }
        public DbSet<SolucaoIA> SolucoesIA { get; set; }
        public DbSet<LogIA> LogsIA { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ============================================================
            // 1. FILTROS GLOBAIS DE SEGURANÇA (SAAS)
            // ============================================================
            modelBuilder.Entity<Chamado>().HasQueryFilter(x => x.EmpresaId == _tenantId);
            modelBuilder.Entity<Usuario>().HasQueryFilter(x => x.EmpresaId == _tenantId);
            modelBuilder.Entity<SolucaoIA>().HasQueryFilter(x => x.EmpresaId == _tenantId);
            modelBuilder.Entity<LogIA>().HasQueryFilter(x => x.EmpresaId == _tenantId);
            modelBuilder.Entity<Interacao>().HasQueryFilter(x => x.EmpresaId == _tenantId);
            modelBuilder.Entity<Categoria>().HasQueryFilter(x => x.EmpresaId == _tenantId);
            modelBuilder.Entity<Notificacao>().HasQueryFilter(x => x.EmpresaId == _tenantId);

            // ============================================================
            // 2. NOMES DAS TABELAS
            // ============================================================
            modelBuilder.Entity<Chamado>().ToTable("Chamados");
            modelBuilder.Entity<Usuario>().ToTable("Usuarios");
            modelBuilder.Entity<Perfil>().ToTable("Perfis");
            modelBuilder.Entity<Interacao>().ToTable("Interacoes");
            modelBuilder.Entity<Categoria>().ToTable("Categorias");
            modelBuilder.Entity<Prioridade>().ToTable("Prioridades");
            modelBuilder.Entity<Notificacao>().ToTable("Notificacoes");
            modelBuilder.Entity<SolucaoIA>().ToTable("SolucoesIA");
            modelBuilder.Entity<LogIA>().ToTable("LogsIA");

            // ============================================================
            // 3. RELACIONAMENTOS (AQUI EVITAMOS O ERRO DE FK)
            // ============================================================

            // --- USUÁRIO ---
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Perfil)
                .WithMany(p => p.Usuarios)
                .HasForeignKey(u => u.IdPerfil)
                .OnDelete(DeleteBehavior.Restrict);

            // --- CHAMADO ---
            modelBuilder.Entity<Chamado>()
                .HasOne(c => c.Autor)
                .WithMany()
                .HasForeignKey(c => c.IdAutor)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Chamado>()
                .HasOne(c => c.Responsavel)
                .WithMany()
                .HasForeignKey(c => c.IdResponsavel)
                .OnDelete(DeleteBehavior.Restrict);

            // Mapeamento explícito para Categoria (Evita CategoriaId fantasma)
            modelBuilder.Entity<Chamado>()
                .HasOne(c => c.Categoria)
                .WithMany()
                .HasForeignKey(c => c.IdCategoria)
                .OnDelete(DeleteBehavior.Restrict);

            // Mapeamento explícito para Prioridade (Evita PrioridadeId fantasma)
            modelBuilder.Entity<Chamado>()
                .HasOne(c => c.Prioridade)
                .WithMany()
                .HasForeignKey(c => c.IdPrioridade)
                .OnDelete(DeleteBehavior.Restrict);

            // --- INTERAÇÃO (CHAT) ---
            modelBuilder.Entity<Interacao>()
                .HasOne(i => i.Autor)
                .WithMany()
                .HasForeignKey(i => i.IdAutor)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Interacao>()
                .HasOne<Chamado>()
                .WithMany()
                .HasForeignKey(i => i.IdChamado)
                .OnDelete(DeleteBehavior.Cascade);
        }

        // --- SOBRESCRITA DO SAVE (AUTO-PREENCHIMENTO) ---
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<ITenant>())
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity.EmpresaId == 0)
                    {
                        entry.Entity.EmpresaId = _tenantId;
                    }
                }
            }
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}