using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Domain.Entidades
{
    public class Usuario : ITenant
    {
        public int Id { get; set; }

        // ==================================================================
        // 1. PROPRIEDADES DE SEGURANÇA E SAAS
        // ==================================================================

        // Identificador do Tenant (Empresa). Substitui a antiga string "Empresa".
        public int EmpresaId { get; set; }

        public string Nome { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;

        // Armazenamos o HASH da senha, nunca a senha em texto puro.
        public string SenhaHash { get; private set; } = string.Empty;

        // ==================================================================
        // 2. DADOS CADASTRAIS E PERFIL
        // ==================================================================

        public string Cargo { get; private set; } = string.Empty;
        public string? Telefone { get; private set; }
        public string? LinkedIn { get; private set; }
        public string? Bio { get; private set; }
        public string? FotoUrl { get; private set; }

        // Relacionamento com Perfil
        public int IdPerfil { get; private set; }
        public virtual Perfil Perfil { get; set; } = null!;

        // ==================================================================
        // 3. CONSTRUTORES
        // ==================================================================

        // Construtor vazio obrigatório para o Entity Framework Core
        protected Usuario() { }

        // Construtor principal usado na criação de usuários (Controller)
        public Usuario(string nome, string email, string senhaHash, int idPerfil, string cargo, int empresaId)
        {
            Nome = nome;
            Email = email;
            SenhaHash = senhaHash;
            IdPerfil = idPerfil;
            Cargo = cargo;
            EmpresaId = empresaId;
        }

        // ==================================================================
        // 4. MÉTODOS DE NEGÓCIO
        // ==================================================================

        public void AtualizarPerfil(string nome, string? telefone, string? fotoUrl, string? linkedIn, string? bio)
        {
            if (!string.IsNullOrEmpty(nome)) Nome = nome;
            Telefone = telefone;
            LinkedIn = linkedIn;
            Bio = bio;

            if (!string.IsNullOrEmpty(fotoUrl)) FotoUrl = fotoUrl;
        }

        // Método para alteração de senha (chamado pelo Controller)
        public bool AlterarSenha(string senhaAtualInformada, string novaSenha)
        {
            // Validação simples para permitir migração. 
            // Na Fase 3 (Segurança), mudaremos para BCrypt.Verify().
            if (SenhaHash != senhaAtualInformada)
                return false;

            SenhaHash = novaSenha;
            return true;
        }

        // Método auxiliar para definir o hash diretamente (usado em Seeds ou Admin)
        public void SetSenhaHash(string hash)
        {
            SenhaHash = hash;
        }
    }
}