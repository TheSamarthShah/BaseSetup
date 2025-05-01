using BaseSetup.Model.Page;
using BaseSetup.Model;
using Microsoft.AspNetCore.Mvc;
using BaseSetup.Repository.Base.Login;

namespace BaseSetup.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LoginController(LoginService loginService) : BaseController
    {
        private readonly LoginService _service = loginService;

        /// <summary>
        /// to check the user credentials
        /// </summary>
        /// <param name="login">contains userid and password</param>
        /// <returns></returns>
        [HttpPost]
        [Route("login")]
        public ResponseModel Login([FromBody] LoginModel.Search login)
        {

            // Call the CheckLogin method from the LoginService to validate the login credentials
            ResultModel resultModel = _service.CheckLogin(login);
            // Convert the result model into a response model
            ResponseModel response = FromResult(resultModel);
            // Return the response model
            return response;

        }
    }
}
