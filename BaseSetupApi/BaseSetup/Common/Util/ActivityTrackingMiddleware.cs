using BaseSetup.Repository.Base.Common;
using System.Security.Claims;

namespace BaseSetup.Common.Util
{
    public class ActivityTrackingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
    {
        private readonly RequestDelegate _next = next;
        private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

        public async Task InvokeAsync(HttpContext context)
        {
            await _next(context); // Wait until request is processed

            // Exclude refresh token requests
            if (!context.Request.Path.Value.Contains("/common/getrefreshedjwttoken"))
            {
                var userId = context.User?.Claims
    .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

                if (!string.IsNullOrEmpty(userId))
                {
                    // Create a new scope to resolve scoped services
                    using var scope = _scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<CommonRepository>();
                    repo.UpdateLastActivity(userId, null, null);
                }
            }
        }
    }
}
