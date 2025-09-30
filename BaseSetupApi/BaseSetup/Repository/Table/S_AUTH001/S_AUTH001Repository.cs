using BaseSetup.Model.Common;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Core;
using System.Data.Common;

namespace BaseSetup.Repository.Table.S_AUTH001
{
	public class S_AUTH001Repository(ISaveDataRepository<S_AUTH001Model> saveDataRepository)
	{
		private readonly ISaveDataRepository<S_AUTH001Model> _saveDataRepository = saveDataRepository;

		public string SaveData(BaseModel.SaveObj<S_AUTH001Model> saveData, DbConnection connection, DbTransaction transaction, bool ignoreUpdtdt = false)
		{
			BeforeSaveData();

			var saveDataParams = new SaveDataParams<S_AUTH001Model>
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

		public string SaveData1(BaseModel.SaveObj<S_AUTH001Model> saveData, DbConnection connection, DbTransaction transaction, bool ignoreUpdtdt = false)
		{
			BeforeSaveData();

			var saveDataParams = new SaveDataParams<S_AUTH001Model>
			{
				Connection = connection,
				Transaction = transaction,
				InsertList = saveData.AddList ?? [],
				UpdateList = saveData.UpdateList ?? [],
				DeleteList = saveData.DeleteList ?? [],
				UPDATEQUERY = S_AUTH001Query.S_AUTH001_UPDATE_1(),
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
