using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using NLog;
using BaseSetup.Common.Util;
using BaseSetup.Model.Common;
using BaseSetup.Model.Core;
using BaseSetup.Model.Page.Common;
using System.Reflection;
using Constants = BaseSetup.Common.Util.Constants;

namespace BaseSetup.Repository.Base.Common
{
	public class CommonService(CommonRepository commonRepo, TokenGenerator jwtTokenGenerator, IConfiguration configuration)
	{
		private readonly CommonRepository _commonRepo = commonRepo;
		private readonly NLog.Logger _logger = LogManager.GetCurrentClassLogger();
		// Token generator for creating JWT tokens
		private readonly TokenGenerator _tokenGenerator = jwtTokenGenerator;
		private readonly IConfiguration _configuration = configuration;

		/// <summary>
		///  Fetch the next number for the given type using the common repository
		/// </summary>
		/// <param name="NOTYP"></param>
		/// <returns></returns>
		public string GetNextNo(string NOTYP)
		{
			return _commonRepo.GetNextNo(NOTYP, null, null);
		}

		public ResultModel GetReferenceScreenData(string tableName, List<ReferenceModel.GridColumn> gridColumns, List<ReferenceModel.Search> filterData, int? offset, int? rows, string? QueryID)
		{
			// Validate input parameters
			if (string.IsNullOrEmpty(tableName) || gridColumns == null || gridColumns.Count == 0)
				return ResultModel.SetFailure(message: "Invalid input parameters.", messagecode:"CODE");

			// Create the base query with selected columns
			string query = "";

			if (!string.IsNullOrEmpty(QueryID))
			{
				var methodInfo = typeof(ReferenceQuery).GetMethod(QueryID, BindingFlags.Public | BindingFlags.Static);
				if (methodInfo != null)
				{
					query = methodInfo.Invoke(null, null) as string;
				}
				else
				{
					return ResultModel.SetFailure(message: $"Query method '{QueryID}' not found in ReferenceQuery.", messagecode: "CODE");
				}
			}
			else
			{
				// Start building the SELECT query
				var selectColumns = new List<string>();

				//Make the list of columns to include in the SELECT clause, handling data type conversions
				foreach (var col in gridColumns)
				{
					string columnExpression;

					switch (col.Datatype) // assuming col.Datatype is an int
					{
						case ColumnDataType.Int:
						case ColumnDataType.Long:
						case ColumnDataType.BigInt:
						case ColumnDataType.Decimal:
							columnExpression = $"TO_NUMBER({col.Name}) AS {col.Name}";
							break;

						case ColumnDataType.Date:
							columnExpression = $"TO_DATE({col.Name}, '{Constants.DateFormatSQL}') AS {col.Name}";
							break;

						case ColumnDataType.String:
						default:
							columnExpression = $"{col.Name} AS {col.Name}";
							break;
					}


					selectColumns.Add(columnExpression);
				}

				// If QueryID is null, use default dynamic query builder
				query = $"SELECT {string.Join(", ", selectColumns)} FROM {tableName}";

				var orderedColumns = gridColumns
					.Where(col => col.queryOrderBySeq != null)
					.OrderBy(col => col.queryOrderBySeq!.Value)
					.Select(col => col.Name)
					.ToList();

				if (orderedColumns.Count != 0)
				{
					query += $" ORDER BY {string.Join(", ", orderedColumns)}";
				}
			}

			// Map the filterData to GetData_ColumnFilter format for dynamic filtering
			List<GetDataColumnFilterModel> queryFilters = [.. filterData.Select(f => new GetDataColumnFilterModel
				{
					ColNm = $"{f.Name}",
					ColDataType = f.Datatype,
					ColInputType = f.Inputtype,  // Convert data_type to ColType
                    ColValFrom = f.Valuefrom,
					ColValTo = f.Valueto,
					MatchType = f.Matchtype
				})]; //TODO - change in frontend

			// Execute the dynamically built query and return result
			dynamic data = _commonRepo.GetReferenceScreenData(query, queryFilters, offset, rows, null, null);

			// Return success if data is found
			if (data != null && data.Records.Count > 0)
			{
				return ResultModel.SetSuccess(new { Records = data.Records, TotalData = data.TotalData });
			}
			else
			{
				// Return no data found message
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		public ResultModel GetSavedConditionSettingList(ConditionSettingModel.Search searchData)
		{
			// Call repository to get the list of saved condition settings
			List<dynamic> data = _commonRepo.GetSavedConditionSettingList(searchData);

			// If data exists, return success with the result
			if (data != null && data.Count > 0)
			{
				return ResultModel.SetSuccess(new { Records = data });
			}
			else
			{
				// No data found
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		public ResultModel GetSavedConditionSetting(ConditionSettingModel.Search searchData)
		{
			// Call repository to get a specific saved condition setting
			List<dynamic> data = _commonRepo.GetSavedConditionSetting(searchData);

			if (data != null && data.Count > 0)
			{
				return ResultModel.SetSuccess(new { ConditionSettingData = data });
			}
			else
			{
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		public ResultModel DeleteConditionSetting(ConditionSettingModel.Search searchData)
		{
			string msg = _commonRepo.DeleteConditionSetting(searchData);
			return ResultModel.SetSuccess(new { });
		}

		public ResultModel SaveConditionSetting(ConditionSettingModel.Save saveData)
		{

			dynamic data = _commonRepo.SaveConditionSetting(saveData);
			return ResultModel.SetSuccess(new { Conditionno = data.conditionno });
		}

		public ResultModel GetLastConditionSetting(ConditionSettingModel.S_SET006 searchData)
		{
			List<dynamic> data = _commonRepo.GetLastConditionSetting(searchData);

			if (data != null && data.Count > 0)
			{
				return ResultModel.SetSuccess(new { ConditionSettingData = data });
			}
			else
			{
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		public ResultModel UpdateLastConditionno(ConditionSettingModel.S_SET006 saveData)
		{
			string data = _commonRepo.UpdateLastConditionno(saveData);
			return ResultModel.SetSuccess(new { });
		}


		/// <summary>
		/// get data for Get_HeightAdjustmentData form
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		public ResultModel Get_HeightAdjustmentData(AutomaticAdjustmentModel saveData)
		{
			List<dynamic> data = _commonRepo.Get_HeightAdjustmentData(saveData);

			if (data != null && data.Count > 0)
			{
				return ResultModel.SetSuccess(new { AdjustMentData = data.First() });
			}
			else
			{
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		/// <summary>
		/// Save data for Save_HeightAdjustmentData form
		/// </summary>
		/// <param name="saveChangeData"></param>
		/// <returns></returns>
		public ResultModel Save_HeightAdjustmentData(AutomaticAdjustmentModel saveChangeData)
		{
			string data = _commonRepo.Save_HeightAdjustmentData(saveChangeData);
			return ResultModel.SetSuccess(new { });
		}

		public ResultModel GetColumnMetaData()
		{
			List<ColumnMetaDataModel> data = _commonRepo.GetColumnMetaData(null, null);
			return ResultModel.SetSuccess(new { metaData = data }); ;
		}

		public ResultModel GetSortingData(string UserId, string FormId)
		{

			// Fetch sorting data from the repository
			List<dynamic> sortingData = _commonRepo.GetSortingData(UserId, FormId);

			// If no data is found, return failure message
			if (sortingData.Count == 0)
			{
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
			else
			{
				// Construct SortingDataModel from the first row of the result
				var sortingColumn = new SortingDataModel
				{
					Userid = sortingData.First().userid,
					Formid = sortingData.First().formid,
					Columns = []
				};
				sortingColumn.Columns.Add(new SortingDataModel.SortColumnDetail { SortSeq = "1", SortColumn = sortingData.First().sortcolumn1, SortType = sortingData.First().asc1 });

				sortingColumn.Columns.Add(new SortingDataModel.SortColumnDetail { SortSeq = "2", SortColumn = sortingData.First().sortcolumn2, SortType = sortingData.First().asc2 });

				sortingColumn.Columns.Add(new SortingDataModel.SortColumnDetail { SortSeq = "3", SortColumn = sortingData.First().sortcolumn3, SortType = sortingData.First().asc3 });

				sortingColumn.Columns.Add(new SortingDataModel.SortColumnDetail { SortSeq = "4", SortColumn = sortingData.First().sortcolumn4, SortType = sortingData.First().asc4 });

				sortingColumn.Columns.Add(new SortingDataModel.SortColumnDetail { SortSeq = "5", SortColumn = sortingData.First().sortcolumn5, SortType = sortingData.First().asc5 });

				// Return success with the sorting data
				return ResultModel.SetSuccess(new { SortingData = sortingColumn });
			}

		}

		public ResultModel SaveSortingData(SortingDataModel SortData)
		{

			// Initialize sorting data object for saving
			var sortingData = new SortingDataModel.S_SET004
			{
				UserId = SortData.Userid ?? string.Empty,
				FormId = SortData.Formid ?? string.Empty
			};

			// Map column sorting preferences based on index
			for (int i = 1; i <= SortData.Columns.Count; i++)
			{
				var column = SortData.Columns[i - 1];

				switch (i)
				{
					case 1:
						sortingData.SortColumn1 = column.SortColumn;
						sortingData.Asc1 = Convert.ToChar(column.SortType ?? "0");
						break;
					case 2:
						sortingData.SortColumn2 = column.SortColumn;
						sortingData.Asc2 = Convert.ToChar(column.SortType ?? "0");
						break;
					case 3:
						sortingData.SortColumn3 = column.SortColumn;
						sortingData.Asc3 = Convert.ToChar(column.SortType ?? "0");
						break;
					case 4:
						sortingData.SortColumn4 = column.SortColumn;
						sortingData.Asc4 = Convert.ToChar(column.SortType ?? "0");
						break;
					case 5:
						sortingData.SortColumn5 = column.SortColumn;
						sortingData.Asc5 = Convert.ToChar(column.SortType ?? "0");
						break;
				}
			}

			// Call repository to save the sorting configuration
			string res = _commonRepo.SaveSortingData(sortingData);

			return ResultModel.SetSuccess(new { });

		}

		public ResultModel GetSwapColumnData(string UserId, string FormId)
		{

			// Fetch swap column data from the repository
			List<dynamic> data = _commonRepo.GetSwapColumnData(UserId, FormId);

			if (data != null && data.Count > 0)
			{
				return ResultModel.SetSuccess(new { ColumnSwapData = data });
			}
			else
			{
				return ResultModel.SetFailure("Messages.MSG_NODATAFOUND", "201");
			}

		}

		public ResultModel SaveSwapColumnData(List<SwapColumnsModel> saveChangeData)
		{

			// Call repository to save swap column changes
			string data = _commonRepo.SaveSwapColumnData(saveChangeData);
			return ResultModel.SetSuccess(new { });

		}

		public ResultModel LogError(LogErrorModel errorDetails)
		{
			string errorId = errorDetails?.ErrorId ?? "Unknown";
			string message = errorDetails?.ErrorMessage ?? "No message provided";
			_logger.Error($"Logged Error: {errorId} - {message}");

			return ResultModel.SetSuccess();
		}

		/// <summary>
		/// To get row hidefilter for grid
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="FormIds"></param>
		/// <returns></returns>
		public ResultModel Gethidefilterdata(string UserId, string FormIds)
		{
			//call the repository
			List<dynamic> data = _commonRepo.Gethidefilterdata(UserId, FormIds);

			if (data != null && data.Count > 0)
			{
				return ResultModel.SetSuccess(new { HideFilterData = data.First() });
			}
			else
			{
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		/// <summary>
		/// To save row hidefilter for grid
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="FormIds"></param>
		/// <param name="Hidefilterkbn"></param>
		/// <returns></returns>
		/*public ResultModel Savehidefilterdata(string UserId, string FormIds, string Hidefilterkbn)
		{
			//call the repository
			string data = _commonRepo.Savehidefilterdata(UserId, FormIds, Hidefilterkbn);
			return ResultModel.SetSuccess(new { });
		}*/

		public ResultModel GetReferenceSetting(ReferenceModel.S_SET008 data)
		{
			List<dynamic> res = _commonRepo.GetReferenceSetting(data);

			if (res != null && res.Count > 0)
			{
				return ResultModel.SetSuccess(new { ReferenceSettings = res.First() });
			}
			else
			{
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}
		/*public ResultModel SaveReferenceSetting(ReferenceModel.S_SET008 data)
		{
			string res = _commonRepo.SaveReferenceSetting(data);
			return ResultModel.SetSuccess(new { });
		}*/

		public ResultModel GetRefreshedJWTToken(string userid, string formid, string refreshtoken)
		{
			// Get section from configuration
			var idleTimeSection = _configuration.GetSection("IdleTimeMins");

			// Default idle time
			int defaultIdleTime = idleTimeSection.GetValue<int>("Default");

			// Get form-specific idle time if present
			int idleTimeMins = defaultIdleTime;
			if (!string.IsNullOrEmpty(formid))
			{
				var formSpecificTime = idleTimeSection.GetValue<int?>(formid.ToUpper()); // case-insensitive form ID
				if (formSpecificTime.HasValue)
				{
					idleTimeMins = formSpecificTime.Value;
				}
			}

			int isValidRefreshToken = _commonRepo.VerifyRefreshToken(userid, refreshtoken, idleTimeMins);
			if (isValidRefreshToken == 1)
			{
				//JWTトークンを生成する
				// Generate a JWT token using the user ID
				string Jwttoken = _tokenGenerator.GenerateJWTToken(userid);
				return ResultModel.SetSuccess(new { jwttoken = Jwttoken });
			}
			else
			{
				return ResultModel.SetFailure(message: "Refresh token data not found!", messagecode: "CODE");
			}
		}

		public ResultModel FileDataGet(string folderPath)
		{
			// Fetch data from repository
			string[] data = _commonRepo.FileDataGet(folderPath);

			// Check if any records were returned
			if (data != null)
			{
				// Return success with data and total count
				return ResultModel.SetSuccess(new { Record = data });
			}
			else
			{
				// Return failure message when no data is found
				return ResultModel.SetFailure(message: "Messages.MSG_NODATAFOUND", messagecode: "CODE");
			}
		}

		public ResultModel FileUpload(BaseModel.FileUploadDownloadModel fileUplodeData)
		{
			int res = _commonRepo.FileUpload(fileUplodeData);

			if (res == 200)
			{
				return ResultModel.SetSuccess(new { });
			}
			else
			{
				return ResultModel.SetFailure(message:"File uplode fail.");
			}
		}

		public ResultModel FileDelete(BaseModel.FileUploadDownloadModel fileDeleteData)
		{
			int res = _commonRepo.FileDelete(fileDeleteData);

			if (res == 200)
			{
				return ResultModel.SetSuccess(new { });
			}
			else
			{
				return ResultModel.SetFailure(message: "File uplode fail.");
			}
		}

		public FileStreamResult FileDownload(BaseModel.FileUploadDownloadModel fileDownloadData)
		{
			return _commonRepo.FileDownload(fileDownloadData);
		}

	}
}
