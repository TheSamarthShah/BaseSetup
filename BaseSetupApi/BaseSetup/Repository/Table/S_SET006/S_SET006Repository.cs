using BaseSetup.Model.Common;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Core;
using System.Data.Common;

namespace BaseSetup.Repository.Table.S_SET006
{
	public class S_SET006Repository(ISaveDataRepository<S_SET006Model> saveDataRepository)
	{
		private readonly ISaveDataRepository<S_SET006Model> _saveDataRepository = saveDataRepository;

		public string SaveData(BaseModel.SaveObj<S_SET006Model> saveData, DbConnection connection, DbTransaction transaction, bool ignoreUpdtdt = false)
		{
			BeforeSaveData();

			var saveDataParams = new SaveDataParams<S_SET006Model>
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
