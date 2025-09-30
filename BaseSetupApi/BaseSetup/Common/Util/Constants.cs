namespace BaseSetup.Common.Util
{
    /// <summary>
    ///  Contains constant values used throughout the application.
    /// </summary>
    public class Constants
    {
        //date and time format used in SQL (Oracle) queries.
        public static readonly string DateFormatSQL = "YYYY/MM/DD HH24:MI:SS";

        //date-only format used for exporting data (txt,csv).
        public static readonly string DateFormatExport = "yyyy/MM/dd";

        //Full date and time format used for exporting data with timestamp.
        public static readonly string DateTimeFormatExport = "yyyy/MM/dd HH:mm:ss";

    }
}
