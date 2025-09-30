using Microsoft.AspNetCore.Mvc;
using BaseSetup.Common.Util;
using BaseSetup.Context;
using BaseSetup.Model.Common;
using BaseSetup.Model.Core;
using BaseSetup.Model.Page.Common;
using BaseSetup.Model.Page.Master;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Core;
using BaseSetup.Repository.Table.M_ITEM0010_TEST;
using static BaseSetup.Model.Common.BaseModel;

namespace BaseSetup.Repository.Page.Master.MITEM0010U
{
	public class MITEM0010URepository(IDBContext dBContext, ISearchDataRepository<MITEM0010UModel.Record> searchDataRepository, IExportDataRepository<MITEM0010UModel.Record> exportDataRepository,
		M_ITEM0010_TESTRepository m_ITEM0010Repository)
	{

		#region FW Region

		private readonly ISearchDataRepository<MITEM0010UModel.Record> _searchDataRepository = searchDataRepository;
		private readonly IExportDataRepository<MITEM0010UModel.Record> _exportDataRepository = exportDataRepository;
		private readonly M_ITEM0010_TESTRepository m_item0010Repository = m_ITEM0010Repository;
		private readonly IDBContext _dbContext = dBContext;

		public MITEM0010UModel GetData(MITEM0010UModel.Search searchData)
		{
			// Open a connection from the DB context
			using var conn = _dbContext.GetConnection();
			conn.Open();

			// Begin a transaction for data integrity
			using var transaction = conn.BeginTransaction();
			try
			{
				// For any logic before fetching data
				BeforeDataFetch();
				// Make filters based on the search conditions
				List<GetDataColumnFilterModel> GetDataFilter = CommonUtil.GetDataFilters<MITEM0010UModel.Search>(searchData, [
						new(){
							Property = x=>x.Hmnm,
							ColNms = ["HMNM", "HMRNM"]
						},
						new(){
							Property = x=>x.Hmrnm,
							ColNms = ["HMNM", "HMRNM"]
						}
					]);

				// Make search parameters
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = transaction,
					DataQuery = MITEM0010UQuery.SELECT_SQL_1(),
					DataFilter = GetDataFilter,
					Offset = searchData.Offset,
					Rows = searchData.Rows,
					UserId = searchData.Userid,
					FormId = searchData.Formid
				};

				// Execute common search using repository
				SearchResponse<MITEM0010UModel.Record> searchRes = _searchDataRepository.SearchDataBase(searchDataBaseParam);

				// Wrap the result in response model
				MITEM0010UModel response = new()
				{
					TotalData = searchRes.TotalData,
					Records = searchRes.Records,
				};

				// For any logic after data is fetched
				AfterDataFetch();

				transaction.Commit();
				return response;
			}
			catch (Exception ex)
			{
				transaction.Rollback();
				throw;
			}
		}

		///<summary>
		/// Exports data to a file (Excel, CSV, etc.) based on search criteria
		///</summary>
		///<param name="searchData"/>
		///<returns></returns>
		public FileStreamResult Exportdata(MITEM0010UModel.Search searchData, List<ExportDataHeader> gridColumnNameAndDisplayNameList, string fileType)
		{
			// Open a database connection
			using var conn = _dbContext.GetConnection();
			conn.Open();

			// Begin a transaction to ensure export integrity
			using var transaction = conn.BeginTransaction();

			try
			{
				// Hook for any pre-processing logic before fetching data for export
				BeforeExportDataFetch();

				// Generate filter conditions based on user input
				List<GetDataColumnFilterModel> GetDataFilter = CommonUtil.GetDataFilters(searchData);

				// Create parameters for export logic
				ExportDataBaseParam ExportDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = transaction,
					DataQuery = MITEM0010UQuery.SELECT_SQL_1(),
					DataFilter = GetDataFilter,
					FileType = fileType,
					UserId = searchData.Userid,
					FormId = searchData.Formid,
				};

				// For any logic after preparing export data
				AfterExportDataFetch();

				// Call export common repository to generate the file
				FileStreamResult file = _exportDataRepository.ExportData(ExportDataBaseParam, gridColumnNameAndDisplayNameList);

				transaction.Commit();

				// Return the generated file
				return file;
			}
			catch (Exception ex)
			{
				// in case the data is not found then commit the transaction and send an empty file which will be
				// detected as blob length 0
				if (ex.Message == "201")
				{
					transaction.Commit();
					return new FileStreamResult(new MemoryStream(), "application/octet-stream");
				}
				transaction.Rollback();
				throw;
			}
		}

		/// <summary>
		/// Saves the data (insert, update, delete) for the M_ITEM0010_TEST table based on the provided saveData object.
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		public string SaveData(BaseModel.SaveObj<MITEM0010UModel.Record> saveData)
		{
			using var conn = _dbContext.GetConnection();
			conn.Open();

			using var transaction = conn.BeginTransaction();
			try
			{
				// Perform any necessary logic before saving data
				BeforeSaveChanges();

				// make SaveObj of table type for table repo
				BaseModel.SaveObj<M_ITEM0010_TESTModel> M_ITEM0010SaveData = CommonUtil.MapSaveObj(
					saveData,
					new List<PropertyMap<MITEM0010UModel.Record, M_ITEM0010_TESTModel>>
					{
						new(x => x.Itemcd,      y => y.Itemcd),
						new(x => x.Productcd,   y => y.Productcd),
						new(x => x.Productno,   y => y.Productno),
						new(x => x.Hmnm,        y => y.Hmnm),
						new(x => x.Hmrnm,       y => y.Hmrnm),
						new(x => x.Webitemcd,   y => y.Webitemcd),
						new(x => x.Jancd,       y => y.Jancd),
						new(x => x.Itemtyp,     y => y.Itemtyp),
						new(x => x.Valstartymd, y => y.Valstartymd),
						new(x => x.Refitemcd,   y => y.Refitemcd),
						new(x => x.Orgitemcd,   y => y.Orgitemcd),
						new(x => x.Priceitemcd, y => y.Priceitemcd),
						new(x => x.Updtdt,      y => y.Updtdt),
                        new(x => x.isactive,      y => y.isactive)
                    }
				);

				string res = m_item0010Repository.SaveData(M_ITEM0010SaveData, conn, transaction);

				// Perform any necessary logic after saving data
				AfterSaveChanges();

				transaction.Commit();
				return res;
			}
			catch (Exception ex)
			{
				transaction.Rollback();
				throw;
			}
			finally
			{
				conn.Close();
			}
		}
		#endregion

		#region Custom Region
		/// <summary>
		/// Write custom logic before data fetching here
		/// </summary>
		private void BeforeDataFetch() { }
		/// <summary>
		/// Write custom logic after data fetching here
		/// </summary>
		private void AfterDataFetch() { }
		/// <summary>
		/// Write custom logic before saving data here
		/// </summary>
		private void BeforeSaveChanges()
		{
		}

		/// <summary>
		/// Write custom logic after saving data here
		/// </summary>
		private void AfterSaveChanges() { }
		/// <summary>
		/// Write custom logic before saving Export data here
		/// </summary>
		private void BeforeExportDataFetch() { }
		/// <summary>
		/// Write custom logic after saving Export data here
		/// </summary>
		private void AfterExportDataFetch() { }
		#endregion
	}
}
