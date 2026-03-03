using System.Collections.Generic;

namespace SystemSupportDesk.Domain.Entidades
{
    public class Perfil
    {
        public int Id { get; private set; }

        // CORREÇÃO: = null! silencia o aviso "Non-nullable property..."
        public string Nome { get; private set; } = null!;
        public string Permissoes { get; private set; } = null!;

        // CORREÇÃO: Inicializar a lista para não ser nula
        public virtual ICollection<Usuario> Usuarios { get; private set; } = new List<Usuario>();

        // Construtor vazio necessário para o EF Core
        protected Perfil() { }

        public Perfil(int id, string nome, string permissoes)
        {
            Id = id;
            Nome = nome;
            Permissoes = permissoes;
        }
    }
}