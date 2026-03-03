using Microsoft.AspNetCore.Http;
using SystemSupportDesk.Domain.Interfaces;

namespace SystemSupportDesk.Infrastructure.Services
{
    public class TenantService : ITenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TenantService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int GetEmpresaId()
        {
            var context = _httpContextAccessor.HttpContext;

            if (context?.User?.Identity?.IsAuthenticated == true)
            {
                var claim = context.User.FindFirst("EmpresaId");
                if (claim != null && int.TryParse(claim.Value, out int empresaId))
                {
                    return empresaId;
                }
            }
            return 0;
        }
    }
}