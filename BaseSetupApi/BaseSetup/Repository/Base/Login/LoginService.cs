using NLog;
using BaseSetup.App_GlobalResources;
using BaseSetup.Common;
using BaseSetup.Model;
using BaseSetup.Model.Page;
using Logger = NLog.Logger;

namespace BaseSetup.Repository.Base.Login
{
    public class LoginService(LoginRepository loginRepository, TokenGenerator jwtTokenGenerator, IConfiguration configuration)
    {
        private readonly LoginRepository _loginRepository = loginRepository;
        // Token generator for creating JWT tokens
        private readonly TokenGenerator _tokenGenerator = jwtTokenGenerator;
        private readonly Logger _logger = LogManager.GetCurrentClassLogger();
        private readonly IConfiguration _configuration = configuration;

        public ResultModel CheckLogin(LoginModel.Search login)
        {
            // Attempt to retrieve login data from the repository
            LoginModel data = _loginRepository.CheckLogin(login);

            if (data != null)
            {
                //JWTトークンを生成する
                // Generate a JWT token using the user ID
                string jwttoken = _tokenGenerator.GenerateJWTToken(login.Userid);

                // Generate a refresh token
                string refreshtoken = _tokenGenerator.GenerateRefreshToken();
                data.Refreshtoken = refreshtoken;
                data.Jwttoken = jwttoken;
                data.JwttokenExpiry = _configuration.GetValue<int>("JwtConfig:TokenValidityMins");

                // Return a success result with the user data containing the tokens
                return ResultModel.SetSuccess(new { userdata = data });
            }
            else
            {
                return ResultModel.SetFailure(Messages.MSG_INVALIDUSER, 201);
            }
        }
    }
}
