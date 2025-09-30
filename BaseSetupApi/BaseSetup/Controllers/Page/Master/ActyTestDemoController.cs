using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using BaseSetup.Model.Common;
using BaseSetup.Model.Page.Common;
using BaseSetup.Model.Page.Master;
using BaseSetup.Repository.Page.Master.MITEM0010U;

namespace BaseSetup.Controllers.Page.Master
{
	
	[Route("[controller]")]
	[ApiController]
	public class ActyTestDemoController(MITEM0010UService service) : BaseController
	{
		private readonly MITEM0010UService _service = service;
		private readonly Logger _logger = LogManager.GetCurrentClassLogger();

		/// <summary>
		/// To get data according to search condition applied
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		[Route("getdata")]
		public ResponseModel GetData([FromBody] MITEM0010UModel.Search searchData)
		{
			ResultModel resultModel = _service.GetData(searchData);
			ResponseModel response = FromResult(resultModel);
			return response;
		}

		/// <summary>
		/// Export data according to search condition applied.
		/// </summary>
		/// <param name="exportData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("Exportdata")]
		public IActionResult Exportdata([FromBody] ExportData<MITEM0010UModel.Search> exportData)
		{
			//common export data service call
			var fileStreamResult = _service.Exportdata(exportData.SearchData, exportData.GridColumnNameAndDisplayNameList, exportData.FileType);
			return fileStreamResult;
		}

		/// <summary>
		/// To save MITEM0010 table data
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		[HttpPost]
		[Route("savedata")]
		public ResponseModel SaveData([FromBody] BaseModel.SaveObj<MITEM0010UModel.Record> saveData)
		{
			//Common save data method call for saving the data
			ResultModel resultModel = _service.SaveData(saveData);
			ResponseModel response = FromResult(resultModel);
			return response;
		}
	}
}
