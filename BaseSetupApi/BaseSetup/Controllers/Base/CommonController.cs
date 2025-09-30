using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using BaseSetup.Model.Common;
using BaseSetup.Model.Page.Common;
using BaseSetup.Repository.Base.Common;
using System.Text.Json;

namespace BaseSetup.Controllers.Base
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CommonController(CommonService service) : BaseController
	{
		private readonly CommonService _service = service;
		private readonly Logger _logger = LogManager.GetCurrentClassLogger();

		/// <summary>
		/// To get the new auto generating number
		/// </summary>
		/// <param name="NOTYP">will be used to generate the new number</param>
		/// <returns>new number generated using S0100 table</returns>
		[HttpPost]
		[Route("getnextNo")]
		public dynamic GetNextNo([FromBody] string NOTYP)
		{
			//Call the GetNextNo service
			string strnextno = _service.GetNextNo(NOTYP);
			if (strnextno != null)
			{
				return new
				{
					statusCode = 200,
					statusMsg = strnextno
				};
			}
			else
			{
				return new
				{
					statusCode = 100,
					statusMsg = "Messages.MSG_NODATAFOUND"
				};
			}
		}

		/// <summary>
		/// To get the reference screen data
		/// </summary>
		/// <param name="refData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("getreferencescreendata")]
		public ResponseModel GetReferenceScreenData([FromBody] dynamic refData)
		{
			//extract Addtional data
			dynamic Addtionaldata = refData.GetProperty("AddtionalData");
            // Extract table Name
            string tableName = Addtionaldata.GetProperty("TableName").GetString();

			// Deserialize columns
			var columns = JsonSerializer.Deserialize<List<ReferenceModel.GridColumn>>(Addtionaldata.GetProperty("Columns").ToString());

			// Deserialize filterValues
			var filterValues = JsonSerializer.Deserialize<List<ReferenceModel.Search>>(Addtionaldata.GetProperty("FilterValues").ToString());
			
			JsonElement offsetProp;
			int? offset = null;

			if (refData.TryGetProperty("Offset", out offsetProp) &&
				offsetProp.ValueKind == JsonValueKind.Number)
			{
				offset = offsetProp.GetInt32();
			}

			JsonElement rowsProp;
			int? rows = null;

			if (refData.TryGetProperty("Rows", out rowsProp) &&
				rowsProp.ValueKind == JsonValueKind.Number)
			{
				rows = rowsProp.GetInt32();
			}

			// Extract QueryID
			string queryId = Addtionaldata.GetProperty("QueryID").GetString();

			// Call the service to get reference screen data
			ResultModel resultModel = _service.GetReferenceScreenData(tableName, columns, filterValues, offset, rows, queryId);
			ResponseModel response = FromResult(resultModel);
			return response;
		}


		/// <summary>
		/// To get all the data of condition setting.
		/// </summary>
		/// <param name="searchData">filter apllied for fetching data</param>
		/// <returns>list of all the data available</returns>
		[HttpPost]
		[Route("getconditiondisplaysettinglist")]
		public ResponseModel GetSavedConditionSettingList([FromBody] ConditionSettingModel.Search searchData)
		{
			// Call the service to get Condition Setting List
			ResultModel result = _service.GetSavedConditionSettingList(searchData);
			ResponseModel response = FromResult(result);
			return response;
		}

		/// <summary>
		/// To get any particular data(only one data) from condition setting
		/// </summary>
		/// <param name="searchData">contains conditionno for data fetching</param>
		/// <returns>Exact one data if found</returns>
		[HttpPost]
		[Route("getconditiondisplaysetting")]
		public ResponseModel GetSavedConditionSetting([FromBody] ConditionSettingModel.Search searchData)
		{
			// Call the service to get Condition Setting
			ResultModel result = _service.GetSavedConditionSetting(searchData);
			ResponseModel response = FromResult(result);
			return response;
		}

		/// <summary>
		/// To delete the condition display setting
		/// </summary>
		/// <param name="searchData">contains conditionno for deleting data</param>
		/// <returns></returns>
		[HttpPost]
		[Route("deleteconditiondisplaysetting")]
		public ResponseModel DeleteConditionSetting([FromBody] ConditionSettingModel.Search searchData)
		{
			// Call the service to delete Condition Setting
			ResultModel result = _service.DeleteConditionSetting(searchData);
			ResponseModel response = FromResult(result);
			return response;
		}

		/// <summary>
		/// To save the condition setting data
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("saveconditiondisplaysetting")]
		public ResponseModel SaveConditionSetting([FromBody] ConditionSettingModel.Save saveData)
		{
			// Call the service to Save Condition Setting
			ResultModel result = _service.SaveConditionSetting(saveData);
			ResponseModel response = FromResult(result);
			return response;
		}

		/// <summary>
		/// To get the last used condition setting data
		/// </summary>
		/// <param name="searchData">contains userid and formid for fetching last used condition setting</param>
		/// <returns></returns>
		[HttpPost]
		[Route("getlastconditionsetting")]
		public ResponseModel GetLastConditionSetting([FromBody] ConditionSettingModel.S_SET006 searchData)
		{
			// Call the service to get last Condition Setting
			ResultModel result = _service.GetLastConditionSetting(searchData);
			ResponseModel response = FromResult(result);
			return response;
		}

		/// <summary>
		/// To update the last used conditionno
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("updatelastconditionno")]
		public ResponseModel UpdateLastConditionno([FromBody] ConditionSettingModel.S_SET006 saveData)
		{
			// Call the service to update last Condition no
			ResultModel result = _service.UpdateLastConditionno(saveData);
			ResponseModel response = FromResult(result);
			return response;
		}

		/// <summary>
		/// To get the height adjustment data for search condition will be collapsed or not on search click
		/// </summary>
		/// <param name="saveData">contains userid and formid for fetching AutomaticAdjustment data</param>
		/// <returns></returns>
		[HttpPost]
		[Route("getheightadjustmentdata")]
		public ResponseModel GetHeightAdjustmentData([FromBody] AutomaticAdjustmentModel saveData)
		{
			// Call the service to get the height adjustment data
			ResultModel res = _service.Get_HeightAdjustmentData(saveData);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To save the heightadjustment data
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("saveheightadjustmentdata")]
		public ResponseModel SaveHeightAdjustmentData([FromBody] AutomaticAdjustmentModel saveData)
		{
			// Call the service to save the height adjustment data
			ResultModel msg = _service.Save_HeightAdjustmentData(saveData);
			ResponseModel response = FromResult(msg);
			return response;
		}

		/// <summary>
		/// To get the column meta data(type, maxlength of all the columns)
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		[Route("getcolumnmetadata")]
		public ResponseModel GetColumnMetaData()
		{
			ResultModel res = _service.GetColumnMetaData();
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To get the dorting data stored by user for any particualr form.
		/// </summary>
		/// <param name="FormData">list will contain userid and formid for which data will be fetched</param>
		/// <returns></returns>
		[HttpPost]
		[Route("getsortingdata")]
		public ResponseModel GetSortingData([FromBody] List<string> FormData)
		{
			// Call the service to get the sorting data
			ResultModel res = _service.GetSortingData(FormData[0], FormData[1]);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To save the sorting data
		/// </summary>
		/// <param name="SortData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("savesortingdata")]
		public ResponseModel SaveSortingData([FromBody] SortingDataModel SortData)
		{
			// Call the service to save the sorting data
			ResultModel res = _service.SaveSortingData(SortData);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To get the swap column data
		/// </summary>
		/// <param name="FormData">list will contain userid and formid for which data will be fetched</param>
		/// <returns></returns>
		[HttpPost]
		[Route("getswapcolumndata")]
		public ResponseModel GetSwapColumnData([FromBody] List<string> FormData)
		{
			// Call the service to get the swap column data
			ResultModel res = _service.GetSwapColumnData(FormData[0], FormData[1]);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To save the swap column data
		/// </summary>
		/// <param name="SwapColumnData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("swapColumnData")]
		public ResponseModel SwapColumnData([FromBody] List<SwapColumnsModel> SwapColumnData)
		{
			// Call the service to save the swap column data
			ResultModel res = _service.SaveSwapColumnData(SwapColumnData);
			ResponseModel response = FromResult(res);
			return response;
		}

		[AllowAnonymous]
		[HttpPost]
		[Route("logerror")]
		public ResponseModel LogError([FromBody] LogErrorModel errorDetails)
		{
			// Call the service to save the swap column data
			ResultModel res = _service.LogError(errorDetails);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To get row hidefilter for grid
		/// </summary>
		/// <param name="hidefilters"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("gethidefilterdata")]
		public ResponseModel Gethidefilterdata([FromBody] List<string> hidefilters)
		{
			ResultModel res = _service.Gethidefilterdata(hidefilters[0], hidefilters[1]);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To save row hidefilter for grid
		/// </summary>
		/// <param name="hidefiltersData"></param>
		/// <returns></returns>
		/*[HttpPost]
		[Route("savehidefilterdata")]
		public ResponseModel Savehidefilterdata([FromBody] List<string> hidefiltersData)
		{
			ResultModel res = _service.Savehidefilterdata(hidefiltersData[0], hidefiltersData[1], hidefiltersData[2]);
			ResponseModel response = FromResult(res);
			return response;
		}*/

		/// <summary>
		/// To get initial search kbn data for table
		/// </summary>
		/// <param name="data"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("getreferencesetting")]
		public ResponseModel GetReferenceSetting([FromBody] ReferenceModel.S_SET008 data)
		{
			ResultModel res = _service.GetReferenceSetting(data);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// To save initial search kbn data for table
		/// </summary>
		/// <param name="data"></param>
		/// <returns></returns>
		/*[HttpPost]
		[Route("savereferencesetting")]
		public ResponseModel SaveReferenceSetting([FromBody] ReferenceModel.S_SET008 data)
		{
			ResultModel res = _service.SaveReferenceSetting(data);
			ResponseModel response = FromResult(res);
			return response;
		}*/

		[AllowAnonymous]
		[HttpPost]
		[Route("getrefreshedjwttoken")]
		public ResponseModel GetRefreshedJWTToken([FromBody] string[] data)
		{
			// Call the service to save the swap column data
			ResultModel res = _service.GetRefreshedJWTToken(data[0], data[1], data[2]);
			ResponseModel response = FromResult(res);
			return response;
		}

		[HttpPost]
		[Route("filedataget")]
		public ResponseModel FileDataGet([FromForm] BaseModel.FileUploadDownloadModel fileUplodeData)
		{
			ResultModel resultModel = _service.FileDataGet(fileUplodeData.PhysicalPath);
			ResponseModel response = FromResult(resultModel);
			return response;
		}

		/// <summary>
		/// This method is for the uploading file
		/// </summary>
		/// <param name="fileUplodeData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("fileupload")]
		public ResponseModel FileUpload([FromForm] BaseModel.FileUploadDownloadModel fileUplodeData)
		{

			ResultModel res = _service.FileUpload(fileUplodeData);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// This method is for the File delete
		/// </summary>
		/// <param name="fileDeleteData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("filedelete")]
		public ResponseModel FileDelete([FromForm] BaseModel.FileUploadDownloadModel fileDeleteData)
		{

			ResultModel res = _service.FileDelete(fileDeleteData);
			ResponseModel response = FromResult(res);
			return response;
		}

		/// <summary>
		/// This method is for the downlode
		/// </summary>
		/// <param name="fileDownloadData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("filedownload")]
		public IActionResult FileDownload([FromForm] BaseModel.FileUploadDownloadModel fileDownloadData)
		{
			var fileStream = _service.FileDownload(fileDownloadData);
			return fileStream;
		}

	}
	}
