using Microsoft.AspNetCore.Mvc;
using NLog;
using System.Data;
using System.Data.Common;
using System.Text;
using BaseSetup.Common;
using BaseSetup.Model.Core;
using Logger = NLog.Logger;

namespace BaseSetup.Repository.Core
{
    /// <summary>
    /// Represents the parameters required for exporting data from a database.
    /// </summary>
    public class ExportDataBaseParam
    {
        //The database connection to be used for the export. (Required)
        public required DbConnection DataConnection { get; set; }
        //The database transaction associated with the export operation. (Required)
        public required DbTransaction DataTransaction { get; set; }
        //The SQL query used to retrieve the data for export. (Required)
        public required string DataQuery { get; set; }
        //list of column filters to be applied to the data query.
        public List<GetData_ColumnFilter> DataFilter { get; set; }
        // The type of file to export (e.g., "xlsx", "csv", "pdf"). (Required)
        public required string FileType { get; set; }
        //user ID for tracking who initiated the export.
        public string? UserId { get; set; }
        //form ID to identify the context or source of the export.
        public string? FormId { get; set; }
    }

    /// <summary>
    /// Repository class for exporting data
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="searchDataRepository"></param>
    public class ExportDataRepository<T>(ISearchDataRepository<T> searchDataRepository) : IExportDataRepository<T>
    {
        // Dependency to search data from the database
        private readonly ISearchDataRepository<T> _searchDataRepository = searchDataRepository;

        /// <summary>
        /// Exports data based on the parameters provided.
        /// </summary>
        /// <param name="exportDataBaseParam"></param>
        /// <param name="gridColumnNameAndDisplayNameList"></param>
        ///<returns>FileStreamResult containing the exported file.</returns>
        /// <exception cref="Exception"></exception>
        public FileStreamResult ExportData(ExportDataBaseParam exportDataBaseParam, List<ExportDataHeader> gridColumnNameAndDisplayNameList)
        {
            SearchDataBaseParam searchDataBaseParam = new()
            {
                DataConnection = exportDataBaseParam.DataConnection,
                DataTransaction = exportDataBaseParam.DataTransaction,
                DataQuery = exportDataBaseParam.DataQuery,
                DataFilter = exportDataBaseParam.DataFilter,
                UserId = exportDataBaseParam.UserId,
                FormId = exportDataBaseParam.FormId,
            };

            List<T> response = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;
            if(response.Count == 0)
            {
                throw new Exception("No data found!");
            }

            // Write and return the exported data in the specified file format (e.g., CSV, Excel)
            return WriteExportData(response, gridColumnNameAndDisplayNameList, exportDataBaseParam.FileType);
        }

        /// <summary>
        /// Generates and returns a file stream for exporting data in the specified file format.
        /// </summary>
        /// <param name="Searchdata">The list of data to export.</param>
        /// <param name="gridColumnNameAndDisplayNameList">List of column headers and display names for export formatting.</param>
        /// <param name="FileType">The desired file type for export (e.g., .csv, .txt).</param>
        /// <returns>A FileStreamResult containing the exported data file.</returns>
        public FileStreamResult WriteExportData(List<T> Searchdata, List<ExportDataHeader> gridColumnNameAndDisplayNameList, string FileType)
        {
            if (Searchdata == null || !Searchdata.Any())
            {
               // If there's no data, return an empty file with a default name
                return new FileStreamResult(new MemoryStream(), "application/octet-stream")
                {
                    FileDownloadName = "EmptyExport.txt"
                };
            }

            // Variables to hold file-specific values
            string contentType;
            byte[] fileBytes;

            // Determine export format and generate file content
            switch (FileType.ToLower())
            {
                case ".csv":
                    contentType = "text/csv";
                    // Generate CSV data with comma as delimiter
                    fileBytes = GenerateDelimitedFile(Searchdata, gridColumnNameAndDisplayNameList, ",");
                    break;

                case ".txt":
                    contentType = "text/plain";
                    // Generate TXT data with pipe delimiter
                    fileBytes = GenerateDelimitedFile(Searchdata, gridColumnNameAndDisplayNameList, " | ");
                    break;

                default:
                    // Throw error for unsupported file types
                    throw new ArgumentException("Invalid file type");
            }

            var memoryStream = new MemoryStream(fileBytes);
            // Return the file as a downloadable stream
            return new FileStreamResult(memoryStream, contentType) { };
        }

        /// <summary>
        /// Generates a delimited text file (e.g., CSV or TXT) from a list of data and headers.
        /// </summary>
        /// <param name="data">The list of data to export.</param>
        /// <param name="gridColumnNameAndDisplayNameList">List of column mappings including field names and their display names.</param>
        /// <param name="delimiter">The delimiter to use (e.g., "," for CSV or " | " for TXT).</param>
        /// <returns>Byte array representing the delimited file content encoded in Shift_JIS.</returns>
        public byte[] GenerateDelimitedFile(List<T> data, List<ExportDataHeader> gridColumnNameAndDisplayNameList, string delimiter)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance); // Register encoding provider

            var sb = new StringBuilder();
            var properties = typeof(T).GetProperties();

            //get the header of the sql data
            var propertiesName = typeof(T).GetProperties().Select(p => p.Name);

            // Match column names from SQL with display names from UI mapping (grid headers)
            var headerNameJP = (from header in gridColumnNameAndDisplayNameList
                                join prop in propertiesName on header.name equals prop
                                select header.displayName).ToList();

            // Header row
            sb.AppendLine(string.Join(delimiter, headerNameJP));

            // Data rows
            foreach (var item in data)
            {
                var formattedValues = new List<string>();

                foreach (var prop in properties)
                {
                    var value = prop.GetValue(item);
                    // Handle specific formatting for DateTimeOffset types
                    if (prop.PropertyType == typeof(DateTimeOffset?) || prop.PropertyType == typeof(DateTimeOffset))
                    {
                        if (value != null)
                        {
                            var matches = gridColumnNameAndDisplayNameList
                                .Where(x => x.name == prop.Name)
                                .ToList();

                            //dataType == "3" to print only date as per the Constants.DateFormatExport
                            if (matches[0].dataType == "3")
                            {
                                value = ((DateTimeOffset)value).ToString(Constants.DateFormatExport);
                            }
                            //dataType == "5" to print dateTime as per the Constants.DateTimeFormatExport
                            else if (matches[0].dataType == "5")
                            {
                                value = ((DateTimeOffset)value).ToString(Constants.DateTimeFormatExport);
                            }
                        }
                    }

                    // Add the value (formatted or raw) to the list, handling nulls
                    formattedValues.Add(value?.ToString() ?? string.Empty);
                }

                // Join the formatted values using the delimiter
                sb.AppendLine(string.Join(delimiter, formattedValues));
            }

            // Return the result using Shift_JIS encoding (code page 932)
            return Encoding.GetEncoding(932).GetBytes(sb.ToString());
        }
    }
}
