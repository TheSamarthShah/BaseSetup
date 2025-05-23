using Microsoft.Data.SqlClient;
using System.Data.Common;

namespace BaseSetup.Context
{
    public class SqlDBContext : IDBContext
    {
        private readonly IConfiguration configuration;

        // SQL Server connection object
        public SqlConnection sqlConnection;

        // SQL Server command object to execute SQL queries or stored procedures
        public SqlCommand sqlCommand;

        /// <summary>
        /// Constructor for SqlDBContext.
        /// </summary>
        /// <param name="configuration"></param>
        public SqlDBContext(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        /// <summary>
        /// Common method to get SQL Server database connection.
        /// </summary>
        /// <returns></returns>
        public DbConnection GetConnection()
        {
            // Create a new SqlConnection using the connection string from appsettings.json
            sqlConnection = new SqlConnection(configuration.GetConnectionString("DefaultConnection"));
            return sqlConnection;
        }
    }
}
