using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using NLog;
using BaseSetup.Model.Common;
using BaseSetup.Common.Util;

namespace BaseSetup.Common.Filters
{
	public class ExceptionFilter : IExceptionFilter
	{
		private static readonly NLog.Logger _logger = LogManager.GetCurrentClassLogger();

		public void OnException(ExceptionContext context)
		{
			// Generate error ID
			string errorId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

			var exception = context.Exception;
			string? message = exception.Message ;
			int statusCode = 500;
			string? messageCode = null;
			object? data = null;
			// Check if it's an AppException
			if (exception is AppException appEx)
			{
				messageCode = appEx.Messagecode;
				// If message code is given then the message will only be used for logging error. Because in client the message will have more priority than code
				if (String.IsNullOrEmpty(messageCode))
				{
					message = appEx.Message; // send exception code in message for identification as we are not using message from here
				}
				else
				{
					message = null;
				}
				data = appEx.Data;
			}

			// Log the exception with error ID
			_logger.Error(exception, "ErrorId: {ErrorId}", errorId);

			// make resopnse object
			ResponseModel response;
			response = new ResponseModel(messageCode, message, data, errorId);

			// Set the context result to return the ResponseModel
			context.Result = new ObjectResult(response)
			{
				StatusCode = statusCode
			};

			context.ExceptionHandled = true;
		}
	}
}
