using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using SystemSupportDesk.Api.Hubs; // <--- Certifique-se de que o ChatHub.cs existe nesta pasta
using SystemSupportDesk.Api.Services;
using SystemSupportDesk.Domain.Interfaces;
using SystemSupportDesk.Infrastructure.Persistencia;
using SystemSupportDesk.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ==================================================================
// 1. FUNDAÇÃO (DB & SAAS)
// ==================================================================

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantService, TenantService>();

builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
    }
});

// ADICIONADO: Serviço de Real-Time
builder.Services.AddSignalR();

// ==================================================================
// 2. SEGURANÇA (JWT)
// ==================================================================
var jwtKey = builder.Configuration["Jwt:Key"]
             ?? throw new InvalidOperationException("JWT Key não configurada no appsettings.");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };

    // ADICIONADO: Lógica para o SignalR pegar o token da URL
    x.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// ==================================================================
// 3. SERVIÇOS
// ==================================================================
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IAService>();
builder.Services.AddHttpClient(); // Permite que o IAService faça chamadas para a internet

// ==================================================================
// 4. API & SWAGGER
// ==================================================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Kovia Desk API (.NET 10)", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new List<string>()
        }
    });
});

// ADICIONADO: Configuração de CORS específica para SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
        policy.SetIsOriginAllowed(_ => true) // Permite qualquer origem (Frontend)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()); // <--- OBRIGATÓRIO PARA SIGNALR
});

var app = builder.Build();

// ==================================================================
// 5. PIPELINE
// ==================================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("PermitirTudo");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat"); // <--- ADICIONADO: Rota do WebSocket

await app.RunAsync();