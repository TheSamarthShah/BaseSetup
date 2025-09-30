namespace BaseSetup.Model.Common
{
	/// <summary>
	/// Defines a class that represents a standard API response model
	/// </summary>
	/// <param name="messagecode">Message code. Message will be with frontend. Use when passing something in HTTP 200.</param>
	/// <param name="message">status msg. Use when some error occurs and this message will be shown.</param>
	/// <param name="data">data to be transmitted from api</param>
	/// <param name="logId">Id by which there will be one log in log file</param>
	public class ResponseModel(string? messagecode = null, string? message = null, object? data = null, string? logId = null)
    {
        // Property to hold the message code of the response
        public string? Messagecode { get; set; } = messagecode;
        // Property to hold a human-readable message describing the response like error , warning and success
        public string? Message { get; set; } = message;
        // Property to hold the actual data returned by the API(any type)
        public object? Data { get; set; } = data;
        // Property to hold unique error id for the exception
        public string? Logid { get; set; } = logId;
    }
}
