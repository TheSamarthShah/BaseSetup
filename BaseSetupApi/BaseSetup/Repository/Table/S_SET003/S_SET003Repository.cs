using BaseSetup.Model.Common;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Core;
using System.Data.Common;

namespace BaseSetup.Repository.Table.S_SET003
{
	public class S_SET003Repository(ISaveDataRepository<S_SET003Model> saveDataRepository)
	{
		private readonly ISaveDataRepository<S_SET003Model> _saveDataRepository = saveDataRepository;

		public string SaveData(BaseModel.SaveObj<S_SET003Model> saveData, DbConnection connection, DbTransaction transaction, bool ignoreUpdtdt = false)
		{
			BeforeSaveData();

			var saveDataParams = new SaveDataParams<S_SET003Model>
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
