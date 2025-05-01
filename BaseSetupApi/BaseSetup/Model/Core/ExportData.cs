namespace BaseSetup.Model.Core
{
    public class ExportDataHeader
    {
        //Represents the English column name
        public string? name { get; set; }

        //Represents the Japanese column name
        public string? displayName { get; set; }

        //1: string, 2: number, 3: date, 4: kbn,5: dateTime
        public string? dataType { get; set; }
    }

    /// <summary>
    /// Generic class to represent export data with search filters and export configurations.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class ExportData<T>
    {
        //Search filter data
        public T SearchData { get; set; }

        //grid columns containing JP display names to be printed in the exported file
        public List<ExportDataHeader> GridColumnNameAndDisplayNameList { get; set; }

        // Type of the export file (e.g., "txt", "csv", "excel").
        public string FileType { get; set; }

    }
}
