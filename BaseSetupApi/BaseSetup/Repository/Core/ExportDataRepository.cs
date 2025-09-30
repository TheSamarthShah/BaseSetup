using Dapper;
using Microsoft.AspNetCore.Mvc;
using BaseSetup.Model.Core;
using BaseSetup.Model.Page.Common;
using System.Data.Common;
using System.Dynamic;
using System.Text;

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
		public DynamicParameters? Parameters { get; set; }
		//list of column filters to be applied to the data query.
		public List<GetDataColumnFilterModel> DataFilter { get; set; }
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
				Parameters = exportDataBaseParam.Parameters,
				DataFilter = exportDataBaseParam.DataFilter,
				UserId = exportDataBaseParam.UserId,
				FormId = exportDataBaseParam.FormId,
			};

			List<T> response = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;
			if (response.Count == 0)
			{
				throw new Exception("201");
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
		public byte[] GenerateDelimitedFile(
			List<T> data,
			List<ExportDataHeader> gridColumnNameAndDisplayNameList,
			string delimiter)
		{
			Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

			var sb = new StringBuilder();

			List<string> propertyNames;
			bool isDynamic = typeof(T) == typeof(object) || typeof(IDynamicMetaObjectProvider).IsAssignableFrom(typeof(T));

			// Resolve property names
			if (isDynamic)
			{
				var first = data.FirstOrDefault();
				if (first is IDictionary<string, object> dict)
				{
					propertyNames = dict.Keys.ToList();
				}
				else if (first != null)
				{
					propertyNames = first.GetType().GetProperties().Select(p => p.Name).ToList();
				}
				else
				{
					propertyNames = new List<string>();
				}
			}
			else
			{
				propertyNames = typeof(T).GetProperties().Select(p => p.Name).ToList();
			}

			// Match column names from SQL with display names from UI mapping (grid headers)
			var headerNameJP = (from header in gridColumnNameAndDisplayNameList
								join propName in propertyNames on header.dataField equals propName
								select header.caption).ToList();

			sb.AppendLine(string.Join(delimiter, headerNameJP));

            //  Make a Sequence for Data as a Header list Sequence
            var orderedMatchedProps = (from header in gridColumnNameAndDisplayNameList
									   join propName in propertyNames on header.dataField equals propName
									   select propName).ToList();

            foreach (var item in data)
			{
				var formattedValues = new List<string>();

				foreach (var propName in orderedMatchedProps)
				{
					if (propName == "Updtdt")
						continue;
                    //  Only process when a matching column exists
                    var matchColumn = gridColumnNameAndDisplayNameList
                                .FirstOrDefault(h => h.dataField == propName);

                    if (matchColumn == null)
                        continue; // skip columns not present in gridColumnNameAndDisplayNameList

                    object? value = null;

					if (isDynamic)
					{
						if (item is IDictionary<string, object> dict && dict.TryGetValue(propName, out var val))
						{
							value = val;
						}
						else
						{
							var propInfo = item.GetType().GetProperty(propName);
							value = propInfo?.GetValue(item);
						}
					}
					else
					{
						var prop = typeof(T).GetProperty(propName);
						value = prop?.GetValue(item);
					}

					// Find matching header metadata
					var match = gridColumnNameAndDisplayNameList.FirstOrDefault(h => h.dataField == propName);

					// Handle DateTimeOffset formatting
					if (value != null &&
						(value is DateTimeOffset || value is DateTimeOffset?) &&
						!string.IsNullOrWhiteSpace(match?.dateFormat))
					{
						value = ((DateTimeOffset)value).ToString(match.dateFormat);
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
