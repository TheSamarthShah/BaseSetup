using Microsoft.AspNetCore.Mvc;
using BaseSetup.Model.Production;
using BaseSetup.Services;

namespace BaseSetup.Controllers
{
    [Route("[controller]")]
    public class ConfigController : ControllerBase
    {
        private readonly ConfigService _configService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private string token;

        public ConfigController(ConfigService configService, IHttpContextAccessor httpContextAccessor)
        {
            _configService = configService;
            _httpContextAccessor = httpContextAccessor;
            token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"];
        }

        [HttpPost]
        public string GetConfigData([FromBody] ConfigPayload payload)
        {
            var ConfigData = _configService.GetData(payload.Path);
            return ConfigData;
        }

        [HttpPost("Translation")]
        public string GetTranslation([FromBody] ConfigPayload payload)
        {
            var ConfigData = _configService.GetTranslation(payload.Path);
            return ConfigData;
        }
    }
}

