using Microsoft.AspNetCore.Mvc;
using BaseSetup.Model.Common;
using BaseSetup.Model.Page.Common;
using BaseSetup.Model.Page.Master;

namespace BaseSetup.Repository.Page.Master.MITEM0010U
{
	public class MITEM0010UService(MITEM0010URepository repository)
	{
		#region FW Region

		private readonly MITEM0010URepository _repository = repository;

		/// <summary>
		/// Get data for MITEM0010U form
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public ResultModel GetData(MITEM0010UModel.Search searchData)
		{
			// perform any other code before fetching data
			BeforeGetData();

			// Fetch data from repository
			MITEM0010UModel data = _repository.GetData(searchData);

			// Check if any records were returned
			if (data.Records.Count > 0)
			{
				// Return success with data and total count
				return ResultModel.SetSuccess(new { Records = data.Records, TotalData = data.TotalData });
			}
			else
			{
				// Return failure message when no data is found
				return ResultModel.SetFailure("NODATAFOUND");
			}

		}

		/// <summary>
		/// Export data for MITEM0010U Form
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public FileStreamResult Exportdata(MITEM0010UModel.Search searchData, List<ExportDataHeader> gridColumnNameAndDisplayNameList, string fileType)
		{
			// Hook for any pre-export
			BeforeExportData();

			//call the common export repository for export data
			return _repository.Exportdata(searchData, gridColumnNameAndDisplayNameList, fileType);
		}

		/// <summary>
		/// Save data for MITEM0010U form
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		public ResultModel SaveData(BaseModel.SaveObj<MITEM0010UModel.Record> saveData)
		{
			// Call the repository to perform the save operation
			string res = _repository.SaveData(saveData);

			// Check if save was successful
			if (res == "SUCCESS")
			{
				return ResultModel.SetSuccess(new());
			}
			else
			{
				return ResultModel.SetFailure("SAVE_ERROR");
			}
		}
		#endregion

		#region Custom Region
		/// <summary>
		/// Custom code before calling GetData of repository
		/// </summary>
		private void BeforeGetData() { }
		/// <summary>
		/// Custom code before calling SaveData of repository
		/// </summary>
		private void BeforeSaveData() { }
		/// <summary>
		/// Custom code before calling ExportData of repository
		/// </summary>
		private void BeforeExportData() { }
		#endregion
	}
}
