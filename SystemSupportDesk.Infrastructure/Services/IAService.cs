using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using SystemSupportDesk.Domain.Entidades;
using SystemSupportDesk.Domain.Enums;
using SystemSupportDesk.Domain.Interfaces;
using SystemSupportDesk.Infrastructure.Persistencia;

namespace SystemSupportDesk.Infrastructure.Services
{
    public class IAService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public IAService(
            AppDbContext context,
            ITenantService tenantService,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task<string?> GerarRespostaIA(int chamadoId, int usuarioLogadoId)
        {
            var chamado = await _context.Chamados
                .Include(c => c.Categoria)
                .FirstOrDefaultAsync(c => c.Id == chamadoId);

            if (chamado == null) return null;

            // REGRA 1: Se o chamado já tem dono oficial, tchau.
            if (chamado.Status == StatusChamado.EmAndamento && chamado.IdResponsavel != null)
                return null;

            // REGRA 2 (NOVA): Se quem mandou a mensagem foi um Analista (alguém que não é o autor),
            // a IA entende que um humano entrou na conversa e fica quieta.
            if (usuarioLogadoId != chamado.IdAutor)
            {
                return null;
            }

            var historico = await _context.Interacoes
                .Where(i => i.IdChamado == chamadoId)
                .OrderBy(i => i.DataCriacao)
                .ToListAsync();

            var textoContexto = (chamado.Titulo + " " + chamado.Descricao).ToLower();
            var solucoes = await _context.SolucoesIA
                .Where(s => textoContexto.Contains(s.Tags))
                .OrderByDescending(s => s.IndiceConfianca)
                .Take(2)
                .ToListAsync();

            var baseInfo = solucoes.Any()
                ? string.Join("\n", solucoes.Select(s => $"Solução Interna: {s.SolucaoDetalhada}"))
                : "Nenhuma solução específica encontrada na base.";

            // --- PROMPT DE COMPORTAMENTO ---
            var systemPrompt = $@"
                Você é o Kovia AI, o suporte inteligente Nível 1.
                
                DADOS DO TICKET:
                - Assunto: {chamado.Titulo} ({chamado.Categoria?.Nome})
                - Base de Conhecimento: {baseInfo}

                DIRETRIZES:
                1. Seja empático e resolutivo. Use emojis moderados (🤖, ✅, ⚠️).
                2. Tente resolver o problema com base no contexto.
                
                GATILHOS DE ESCALONAMENTO (Responda APENAS: [HANDOFF]):
                - Se o usuário pedir explicitamente ('falar com atendente', 'humano', 'suporte', 'pessoa').
                - Se o usuário demonstrar irritação, frustração ou disser que a solução anterior não funcionou.
                - Se você não tiver certeza absoluta da resposta técnica.
                - Se o problema envolver dados sensíveis, senhas ou acesso remoto.
            ";

            var messages = new List<object> { new { role = "system", content = systemPrompt } };

            foreach (var msg in historico.TakeLast(6))
            {
                messages.Add(new
                {
                    role = msg.IdAutor == chamado.IdAutor ? "user" : "assistant",
                    content = msg.Mensagem
                });
            }

            var requestBody = new
            {
                model = _configuration["Groq:Model"] ?? "llama-3.3-70b-versatile",
                messages = messages,
                temperature = 0.3,
                max_tokens = 350
            };

            var apiKey = _configuration["Groq:ApiKey"];
            var url = "https://api.groq.com/openai/v1/chat/completions";

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            try
            {
                var response = await _httpClient.PostAsync(url, jsonContent);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) return null;

                using var doc = JsonDocument.Parse(responseString);
                var respostaTexto = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()?.Trim();

                // --- LÓGICA DE TRANSBORDO ---
                if (respostaTexto != null && (
                    respostaTexto.Contains("[HANDOFF]") ||
                    respostaTexto.Contains("[HUMANO]") ||
                    respostaTexto.ToLower().Contains("desculpe") // Gatilho de segurança extra
                ))
                {
                    // 1. Devolve para a fila (Status Novo, Sem Responsável)
                    chamado.EncaminharParaFila();

                    // 2. Registra LOG interno para auditoria
                    var log = new LogIA(chamado.EmpresaId, "Transbordo Humano", "IA identificou necessidade de escalonamento.", chamado.Id);
                    _context.LogsIA.Add(log);

                    _context.Chamados.Update(chamado);
                    await _context.SaveChangesAsync();

                    // 3. MENSAGEM PROFISSIONAL DE ENCERRAMENTO DA IA
                    return "Compreendo perfeitamente. 🤝\n\n" +
                           "Para garantir a melhor solução, estou **escalando seu ticket para nossa equipe de especialistas**.\n" +
                           "Já registrei todo o nosso histórico e um analista humano assumirá este atendimento em instantes.\n\n" +
                           "Obrigado pela paciência! 🚀";
                }

                return respostaTexto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IA ERROR]: {ex.Message}");
                return null;
            }
        }
    }
}