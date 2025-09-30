using BaseSetup.Model.Common;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Base.Common;
using BaseSetup.Repository.Core;
using System.Data.Common;

namespace BaseSetup.Repository.Table.M_ITEM0010_TEST
{
	public class M_ITEM0010_TESTRepository(ISaveDataRepository<M_ITEM0010_TESTModel> saveDataRepository, CommonRepository commonRepository)
	{
		private readonly ISaveDataRepository<M_ITEM0010_TESTModel> _saveDataRepository = saveDataRepository;
		private readonly CommonRepository _commonRepository = commonRepository;

		public string SaveData(BaseModel.SaveObj<M_ITEM0010_TESTModel> saveData, DbConnection connection, DbTransaction transaction, bool ignoreUpdtdt = false)
		{
			BeforeSaveData(connection, transaction, saveData);

			var saveDataParams = new SaveDataParams<M_ITEM0010_TESTModel>
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
		private void BeforeSaveData(DbConnection connection, DbTransaction transaction, BaseModel.SaveObj<M_ITEM0010_TESTModel> saveData)
		{
			if (saveData.Formid == "MITEM0010U" || saveData.Formid == "MITEM0011U")
			{
				if (saveData.AddList != null)
				{
					foreach (var newRow in saveData.AddList)
					{
						var nextItemCode = _commonRepository.GetNextNo("ITEMCD", connection, transaction);
						newRow.Itemcd.Value = nextItemCode;
					}
				}
			}
		}

		/// <summary>
		/// Write custom logic after saving data here
		/// </summary>
		private void AfterSaveData() { }
	}
}
