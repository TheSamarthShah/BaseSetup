using Oracle.ManagedDataAccess.Client;
using System.Data.Common;

namespace ThomasWebAPI.Context
{
    public class OraDBContext : IDBContext
    {
        private readonly IConfiguration configuration;
        // Oracle database connection object
        public OracleConnection oracleconnection;
        // Oracle command object to execute SQL queries or stored procedures
        public OracleCommand oraclecommand;

        /// <summary>
        /// Constructor for OraDBContext.
        /// </summary>
        /// <param name="configuration"></param>
        public OraDBContext(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        /// <summary>
        ///  Common method to get Oracle database connection.
        /// </summary>
        /// <returns></returns>
        public DbConnection GetConnection()
        {
            // Create a new OracleConnection using the connection string from appsettings.json
            oracleconnection = new OracleConnection(configuration.GetConnectionString("DefaultConnection"));
            return oracleconnection;
        }
    }
}
