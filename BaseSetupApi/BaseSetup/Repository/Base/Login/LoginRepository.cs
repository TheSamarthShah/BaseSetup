using Dapper;
using BaseSetup.Context;
using BaseSetup.Model.Page.Login;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Base.Common;
using BaseSetup.Repository.Table.S_AUTH001;
using static BaseSetup.Model.Common.BaseModel;

namespace BaseSetup.Repository.Base.Login
{
	public class LoginRepository(IDBContext dbContext, CommonRepository commonRepository,S_AUTH001Repository s_AUTH001Repository)
	{
		private readonly IDBContext _dbContext = dbContext;  // Database context to interact with the database
		private readonly CommonRepository _commonRepository = commonRepository;
		private readonly S_AUTH001Repository _s_AUTH001Repository = s_AUTH001Repository;

		/// <summary>
		/// This method is for checking the authentication
		/// </summary>
		/// <param name="login"></param>
		/// <returns></returns>
		public LoginModel CheckLogin(LoginModel.Search login)
		{
			using var conn = _dbContext.GetConnection();

			try
			{
				// Define the SQL query to retrieve the user data based on the credentials
				string sql = LoginQuery.S_AUTH001_SELECT_1();
				// Define the parameters for the SQL query
				var parames = new
				{
					userid = login.Userid,
					password = login.Password
				};

				// Execute the query and retrieve the first result
				LoginModel user = conn.QueryFirstOrDefault<LoginModel>(sql, parames);

				// Return the retrieved user data
				return user;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		public void SaveRefreshToken(string userid, string refreshtoken)
		{
			using var conn = _dbContext.GetConnection();
			conn.Open();

			using var trans = conn.BeginTransaction();
			try
			{
				
				S_AUTH001Model s_AUTH001Model = new S_AUTH001Model();
				s_AUTH001Model.Userid.Value = userid;
				s_AUTH001Model.Refreshtoken.Value = refreshtoken;

				SaveObj<S_AUTH001Model> s_AUTH001SaveData = new();
				s_AUTH001SaveData.UpdateList = [s_AUTH001Model];

				_s_AUTH001Repository.SaveData(ignoreUpdtdt: true,connection: conn, transaction: trans, saveData: s_AUTH001SaveData);

				_commonRepository.UpdateLastActivity(userid, conn, trans);

				trans.Commit();
			}
			catch (Exception ex)
			{
				trans.Rollback();
				throw;
			}
		}
	}
}
