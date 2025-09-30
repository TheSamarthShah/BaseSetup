namespace BaseSetup.Common.Util
{
    /// <summary>
    /// Use AppException class which is extension of exception with additional property of ExceptionCode.
    /// ExceptionCode is for unique identification for application exceptions.
    /// Data is for sending data like invalid rows with the exception
    /// </summary>
    public class AppException : Exception
    {
        public string Messagecode { get; }
        public object Data { get; set; } = null;

        public AppException(string messageCode, object data, string message)
            : base(message)
        {
			Messagecode = messageCode;
            Data = data;
        }
    }

	/// <summary>
	/// Register application errors with their unique codes here.
	/// </summary>
	public class MessageCodes
    {
        public const string RowModified = "COM0001";
        public const string RowAlreadyExists = "COM0002";
        public const string FileNotExists = "COM0003";
    }
}
