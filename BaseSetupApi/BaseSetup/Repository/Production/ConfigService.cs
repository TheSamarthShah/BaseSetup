using Newtonsoft.Json.Linq;
using BaseSetup.Model;

namespace BaseSetup.Services
{
    public class ConfigService
    {
        private readonly AppDbContext _dbContext;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        public static string APIServiceURL;

        public ConfigService(AppDbContext dbContext, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _httpClient = new HttpClient();
            _configuration = configuration;
        }

        // Helper: Navigate inside JObject/JArray by path
        public JToken NavigateJson(JToken document, string path)
        {
            JToken current = document;

            // If root is array, pick first element
            if (current is JArray arr && arr.Count > 0)
                current = arr[0];

            foreach (var field in path.Split('.'))
            {
                if (current == null)
                {
                    break;
                }

                if (current is JObject obj)
                {
                    current = obj[field];
                }
                else if (current is JArray && int.TryParse(field, out int index))
                {
                    var array = current as JArray;
                    if (index >= 0 && index < array.Count)
                    {
                        current = array[index];
                    }
                    else
                    {
                        return null;
                    }
                }
                else
                {
                    return null;
                }
            }

            return current;
        }

        // ================= Translation Section =================

        public string GetTranslation(string path)
        {
            var config = _dbContext.TranslationConfigs.FirstOrDefault(c => c.Name == "Translation");
            if (config == null)
            {
                return null;
            }

            var jToken = JToken.Parse(config.JsonData);
            var value = NavigateJson(jToken, path);

            return value?.ToString();
        }

        // ================= Nipon Data Section =================

        public string GetData(string path)
        {
            var config = _dbContext.AppConfigs.FirstOrDefault();
            if (config == null)
            {
                return null;
            }

            var jToken = JToken.Parse(config.JsonData);
            var value = NavigateJson(jToken, path);

            return value?.ToString();
        }
    }
}
