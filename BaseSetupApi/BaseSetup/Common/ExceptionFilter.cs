using BaseSetup.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using NLog;

namespace BaseSetup.Common
{
    public class ExceptionFilter : IExceptionFilter
    {
        private static readonly NLog.Logger _logger = LogManager.GetCurrentClassLogger();

        public void OnException(ExceptionContext context)
        {
            // Generate error ID
            string errorId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

            // Log the exception with error ID
            _logger.Error(context.Exception, "ErrorId: {ErrorId}", errorId);

            // make resopnse object
            ResponseModel response;
            response = new ResponseModel(500, "Internal Server Error", null, errorId);

            // Set the context result to return the ResponseModel
            context.Result = new ObjectResult(response)
            {
                StatusCode = response.Code
            };

            context.ExceptionHandled = true;
        }
    }
}
