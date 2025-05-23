using BaseSetup.Model.Page;
using BaseSetup.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseSetup.Repository.Shared.Common;

namespace BaseSetup.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class CommonController(CommonService service) : BaseController
    {
        private readonly CommonService _service = service;
        [HttpPost]
        [Route("logerror")]
        public ResponseModel LogError([FromBody] LogErrorModel err)
        {

            // Call the CheckLogin method from the LoginService to validate the login credentials
            ResultModel resultModel = _service.LogError(err);
            // Convert the result model into a response model
            ResponseModel response = FromResult(resultModel);
            // Return the response model
            return response;

        }
    }
}
