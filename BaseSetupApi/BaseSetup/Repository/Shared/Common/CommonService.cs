using BaseSetup.Model.Page;
using BaseSetup.Model;
using Microsoft.AspNetCore.Mvc;
using NLog;

namespace BaseSetup.Repository.Shared.Common
{
    public class CommonService
    {
        private static readonly Logger _logger = LogManager.GetCurrentClassLogger();
        public ResultModel LogError([FromBody] LogErrorModel logError)
        {
            if (logError == null)
            {
                return ResultModel.SetFailure("Error log is null", 400);
            }

            _logger.Error($"ErrorId: {logError.ErrorId}, ErrorMessage: {logError.ErrorMessage}");

            return ResultModel.SetSuccess("Log success");
        }
    }
}
