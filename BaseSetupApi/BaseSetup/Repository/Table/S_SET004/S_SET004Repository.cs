using BaseSetup.Model.Common;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Core;
using System.Data.Common;

namespace BaseSetup.Repository.Table.S_SET004
{
	public class S_SET004Repository(ISaveDataRepository<S_SET004Model> saveDataRepository)
	{
		private readonly ISaveDataRepository<S_SET004Model> _saveDataRepository = saveDataRepository;

		public string SaveData(BaseModel.SaveObj<S_SET004Model> saveData, DbConnection connection, DbTransaction transaction, bool ignoreUpdtdt = false)
		{
			BeforeSaveData();

			var saveDataParams = new SaveDataParams<S_SET004Model>
			{
				Connection = connection,
				Transaction = transaction,
				InsertList = saveData.AddList ?? [],
				UpdateList = saveData.UpdateList ?? [],
				DeleteList = saveData.DeleteList ?? [],
				Userid = saveData.Userid,
				Programnm = saveData.Programnm,
				IgnoreUpdtdt = ignoreUpdtdt
			};

			var result = _saveDataRepository.SaveDataBase(saveDataParams);
			AfterSaveData();
			return result;
		}

		/// <summary>
		/// Write custom logic before saving data here
		/// </summary>
		private void BeforeSaveData()
		{
		}

		/// <summary>
		/// Write custom logic after saving data here
		/// </summary>
		private void AfterSaveData() { }
	}
}
