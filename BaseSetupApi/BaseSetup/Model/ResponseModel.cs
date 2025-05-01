namespace BaseSetup.Model
{
    /// <summary>
    /// Defines a class that represents a standard API response model
    /// </summary>
    /// <param name="code">status code of the response</param>
    /// <param name="message">status msg</param>
    /// <param name="data">data to be transmitted from api</param>
    public class ResponseModel(int code, string message, object data, string? errorId = null)
    {
        // Property to hold the status code of the response (e.g., 200 for success, 400 for bad request)
        public int Code { get; set; } = code;
        // Property to hold a human-readable message describing the response like error , warning and success
        public string Message { get; set; } = message;
        // Property to hold the actual data returned by the API(any type)
        public object Data { get; set; } = data;
        // Property to hold unique error id for the exception
        public string? ErrorId { get; set; }= errorId;
    }
}
