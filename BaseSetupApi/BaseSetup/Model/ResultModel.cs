using NLog;

namespace BaseSetup.Model
{
    /// <summary>
    /// Result model for API responses.
    /// </summary>
    public class ResultModel
    {
        private static readonly Logger _logger = LogManager.GetCurrentClassLogger();
        //Indicates whether the operation was successful.
        public bool Success { get; set; }
        //The status or error code of the result.
        public int Code { get; set; }
        //The message associated with the result (error, warning and success)
        public string Message { get; set; }
        //The data returned by the operation, if any.
        public object? Data { get; set; }
        //The unique error id for errors
        public string? ErrorId { get; set; }

        /// <summary>
        /// Creates a success result with the provided data and optional message.
        /// </summary>
        /// <param name="data"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ResultModel SetSuccess(object data, string message = "")
        {
            ResultModel result = new()
            {
                Success = true,
                Message = message,
                Data = data
            };
            return result;
        }

        /// <summary>
        ///  Creates a failure result with the provided message and error code.
        /// </summary>
        /// <param name="message"></param>
        /// <param name="code"></param>
        /// /// <param name="ex"></param>
        /// <returns></returns>
        public static ResultModel SetFailure(string message, int? code = null, Exception? ex = null)
        {
            string errorId = "";
            // if exception is passed then log it else no need to log
            if (ex != null)
            {
                errorId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
                // Log the exception with error ID for tracking
                _logger.Error($"ErrorId: {errorId}, Exception: {ex}");
            }

            return new ResultModel
            {
                Success = false,
                Message = message,
                Code = code ?? 500,
                ErrorId = errorId
            };
        }

    }
}
