using Microsoft.AspNetCore.Mvc;
using BaseSetup.Model.Core;

namespace BaseSetup.Repository.Core
{
    public interface IExportDataRepository<T>
    {
        //To export data file by retrieving the data from the database.
        FileStreamResult ExportData(ExportDataBaseParam exportDataBaseParam, List<ExportDataHeader> gridColumnNameAndDisplayNameList);
        //To export data, which is received from the client side.
        FileStreamResult WriteExportData(List<T> Searchdata, List<ExportDataHeader> gridColumnNameAndDisplayNameList, string FileType);
    }
}
