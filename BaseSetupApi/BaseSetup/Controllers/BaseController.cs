using Microsoft.AspNetCore.Mvc;
using BaseSetup.Model.Common;

namespace BaseSetup.Controllers
{
	public class BaseController : Controller
	{
		/// <summary>
		/// Converts a ResultModel into a ResponseModel, mapping success and error appropriately
		/// </summary>
		/// <param name="result"></param>
		/// <returns></returns>
		protected ResponseModel FromResult(ResultModel result)
		{
			return new ResponseModel(result.Messagecode, result.Message, result.Data, result.Logid);
		}
	}
}
