using Dapper;
using BaseSetup.Context;
using BaseSetup.Model.Page;
    
namespace BaseSetup.Repository.Base.Login
{
    public class LoginRepository(IDBContext dbContext)
    {
        private readonly IDBContext _dbContext = dbContext;  // Database context to interact with the database

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
                string sql = "";
                // Define the parameters for the SQL query
                var parames = new
                {
                    userid = login.Userid,
                    password = login.Password
                };

                // Execute the query and retrieve the first result
                // LoginModel user = conn.QueryFirstOrDefault<LoginModel>(sql, parames);
                LoginModel user = new();
                // Return the retrieved user data
                return user;
            }
            catch(Exception ex)
            {
                throw;
            }
        }
    }
}
