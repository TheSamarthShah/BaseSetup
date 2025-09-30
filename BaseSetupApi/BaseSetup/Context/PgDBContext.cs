using Npgsql;
using System.Data.Common;

namespace BaseSetup.Context
{
	public class PgDBContext : IDBContext
	{
		private readonly IConfiguration configuration;
		// Postgres connection object
		private NpgsqlConnection pgConnection;

		/// <summary>
		/// Constructor for PgDBContext.
		/// </summary>
		/// <param name="configuration"></param>
		public PgDBContext(IConfiguration configuration)
		{
			this.configuration = configuration;
		}

		/// <summary>
		/// Common method to get Postgres database connection.
		/// </summary>
		/// <returns></returns>
		public DbConnection GetConnection()
		{
			pgConnection = new NpgsqlConnection(configuration.GetConnectionString("PostgresConnection"));
			return pgConnection;
		}

		public string ParameterPrefix => "@";
	}
}
