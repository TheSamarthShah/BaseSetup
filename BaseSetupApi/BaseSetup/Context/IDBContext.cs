using Oracle.ManagedDataAccess.Client;
using System.Data.Common;

namespace BaseSetup.Context
{
    public interface IDBContext
    {
        public DbConnection GetConnection();

        string ParameterPrefix { get; }
    }
}
