using BaseSetup.Common.Util;
using BaseSetup.Model.Common;
using BaseSetup.Model.Page.Login;

namespace BaseSetup.Repository.Base.Login
{
	public class LoginService(LoginRepository loginRepository, TokenGenerator jwtTokenGenerator, IConfiguration configuration)
	{
		private readonly LoginRepository _loginRepository = loginRepository;
		// Token generator for creating JWT tokens
		private readonly TokenGenerator _tokenGenerator = jwtTokenGenerator;
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

				SaveRefreshToken(login.Userid, refreshtoken);

				// Return a success result with the user data containing the tokens
				return ResultModel.SetSuccess(new { userdata = data });
			}
			else
			{
				return ResultModel.SetFailure(messagecode: "E_MSG001", message: "指定されたユーザーIDまたはパスワードが正しくありません。");
			}
		}

		public void SaveRefreshToken(string userid, string refreshtoken)
		{
			_loginRepository.SaveRefreshToken(userid, refreshtoken);
		}
	}
}
