using NLog;

namespace BaseSetup.Model.Common
{
    /// <summary>
    /// Result model for API responses.
    /// </summary>
    public class ResultModel
    {
        private static readonly Logger _logger = LogManager.GetCurrentClassLogger();
        //The status or error code of the result.
        public string Messagecode { get; set; }
        //The message associated with the result (error, warning and success)
        public string Message { get; set; }
        //The data returned by the operation, if any.
        public object? Data { get; set; }
        //The unique error id for errors
        public string? Logid { get; set; }

        /// <summary>
        /// Creates a success result with the provided data and optional message.
        /// </summary>
        /// <param name="data"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public static ResultModel SetSuccess(object? data = null)
        {
            ResultModel result = new()
            {
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
		public static ResultModel SetFailure(string? messagecode = null, string? message = null, Exception? ex = null)
        {
            string logid = "";
            // if exception is passed then log it else no need to log
            if (ex != null)
            {
                logid = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
                // Log the exception with error ID for tracking
                _logger.Error($"Error id: {logid}, Exception: {ex}");
            }

            return new ResultModel
            {
                Message = message,
                Messagecode = messagecode,
                Logid = logid
            };
        }
    }
}
