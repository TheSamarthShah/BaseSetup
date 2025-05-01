using BaseSetup.Model;
using Microsoft.AspNetCore.Mvc;

namespace BaseSetup.Controllers
{
    public class BaseController : Controller
    {
        /// <summary>
        /// Returns a success response with status code 200, optional message, and data
        /// </summary>
        /// <param name="data"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        protected ResponseModel Success(object data, string message = "")
        {
            return new ResponseModel(200, message, data);
        }

        /// <summary>
        /// Returns an error response with specified status code and message
        /// </summary>
        /// <param name="message"></param>
        /// <param name="code"></param>
        /// /// <param name="ErrorId"></param>
        /// <returns></returns>
        protected ResponseModel Error(string message, int code, string? ErrorId)
        {
            return new ResponseModel(code, message, null, ErrorId);
        }

        /// <summary>
        /// Converts a ResultModel into a ResponseModel, mapping success and error appropriately
        /// </summary>
        /// <param name="result"></param>
        /// <returns></returns>
        protected ResponseModel FromResult(ResultModel result)
        {
            if (result.Success)
            {
                return Success(result.Data, result.Message);
            }
            else
            {
                return Error(result.Message, result.Code, result.ErrorId);
            }
        }
    }
}
