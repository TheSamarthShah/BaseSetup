using System.Data.Common;

namespace BaseSetup.Context
{
    public interface IDBContext
    {
        public DbConnection GetConnection();
    }
}
