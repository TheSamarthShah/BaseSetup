using Dapper;
using Microsoft.AspNetCore.Mvc;
using BaseSetup.Common.Util;
using BaseSetup.Context;
using BaseSetup.Model.Common;
using BaseSetup.Model.Core;
using BaseSetup.Model.Page.Common;
using BaseSetup.Model.Table;
using BaseSetup.Repository.Core;
using BaseSetup.Repository.Table.S_AUTH001;
using BaseSetup.Repository.Table.S_SET001;
using BaseSetup.Repository.Table.S_SET002;
using BaseSetup.Repository.Table.S_SET003;
using BaseSetup.Repository.Table.S_SET004;
using BaseSetup.Repository.Table.S_SET005;
using BaseSetup.Repository.Table.S_SET006;
using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.Globalization;
using static BaseSetup.Model.Common.BaseModel;

namespace BaseSetup.Repository.Base.Common
{
	public class CommonRepository(IDBContext dbContext, ISearchDataRepository<dynamic> searchDataRepository, ISaveDataRepository<dynamic> saveDataRepository, S_SET001Repository s_set001Repository, S_SET002Repository s_set002Repository, S_SET003Repository s_set003Repository, S_SET004Repository s_set004Repository, S_SET005Repository s_set005Repository, S_SET006Repository s_set006Repository, S_AUTH001Repository s_AUTH001Repository)
	{
		private readonly IDBContext _dBContext = dbContext;
		private readonly ISearchDataRepository<dynamic> _searchDataRepository = searchDataRepository;
		private readonly ISaveDataRepository<dynamic> _saveDataRepo = saveDataRepository;
		private readonly S_SET001Repository _s_set001Repository = s_set001Repository;
		private readonly S_SET002Repository _s_set002Repository = s_set002Repository;
        private readonly S_SET003Repository _s_set003Repository = s_set003Repository;
        private readonly S_SET004Repository _s_set004Repository = s_set004Repository;
        private readonly S_SET005Repository _s_set005Repository = s_set005Repository;
        private readonly S_SET006Repository _s_set006Repository = s_set006Repository;
		private readonly S_AUTH001Repository _s_AUTH001Repository = s_AUTH001Repository;

		/// <summary>
		///  Retrieves the next number for a given type using the stored procedure 'pr_sys_getnextno'.
		/// </summary>
		/// <param name="NOTYP"></param>
		/// <param name="connection"></param>
		/// <param name="transaction"></param>
		/// <returns></returns>
		public string GetNextNo(string NOTYP, dynamic? connection, dynamic? transaction)
		{
			var conn = (connection as IDbConnection) ?? _dBContext.GetConnection();

			if (conn.State != ConnectionState.Open)
			{
				conn.Open();
			}

			var shouldCommit = transaction == null;
			var tran = (transaction as IDbTransaction) ?? conn.BeginTransaction();

			try
			{
                var result = conn.QueryFirst<string>(
                "SELECT sc_main.fn_sys_getnextno(@av_appid, @av_notyp)",
                new { av_appid = "SEIRA", av_notyp = NOTYP },
                tran
            );

                if (shouldCommit) tran.Commit();

                return result;
            }
			catch (Exception ex)
			{
				if (shouldCommit) tran.Rollback();
				throw;
			}
			finally
			{
				if (connection == null)
				{
					conn.Close();
					conn.Dispose();
				}
			}
		}

		/// <summary>
		/// To get the reference screen data
		/// </summary>
		/// <param name="query"></param>
		/// <param name="queryFilter"></param>
		/// <param name="connection"></param>
		/// <param name="transaction"></param>
		/// <returns></returns>
		public dynamic GetReferenceScreenData(string query, List<GetDataColumnFilterModel> queryFilter, int? offset, int? rows, dynamic? connection, dynamic? transaction)
		{
			// Use provided connection or create a new one from the context
			var conn = (connection as IDbConnection) ?? _dBContext.GetConnection();

			// Open the connection if it is not already open
			if (conn.State != ConnectionState.Open)
			{
				conn.Open();
			}

			// Use provided transaction or start a new one
			var tran = (transaction as IDbTransaction) ?? conn.BeginTransaction();

			try
			{
				// Create the parameter object to pass to the search repository
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn as DbConnection,          // To open DB connection
					DataTransaction = tran as DbTransaction,        // Current transaction
					DataQuery = query,                              // SQL query to execute
					DataFilter = queryFilter,                       // Column filters to apply
					Offset = offset,
					Rows = rows,
				};
				// Execute the query and retrieve the result
				dynamic data = _searchDataRepository.SearchDataBase(searchDataBaseParam);

				if (transaction == null) tran.Commit();

				// Return the fetched data
				return new
				{
					Records = data.Records,
					TotalData = data.TotalData,
				};
			}
			catch (Exception ex)
			{
				if (transaction == null) tran.Rollback();
				throw;
			}
			finally
			{
				if (connection == null) conn.Close();
			}
		}

		/// <summary>
		/// To get the condition setting list
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public dynamic GetSavedConditionSettingList(ConditionSettingModel.Search searchData)
		{
			using var con = _dBContext.GetConnection();
			con.Open();

			using var trans = con.BeginTransaction();

			try
			{
				// Prepare a list of column filters to apply to the search query
				List<GetDataColumnFilterModel> columns =
				[
					new GetDataColumnFilterModel
					{
						ColNm = "CONDITIONNM",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Conditionnm?.From,
						ColValTo = searchData.Conditionnm?.To,
						MatchType = searchData.Conditionnm?.Type
					},
					new GetDataColumnFilterModel
					{
						ColNm = "FORMID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Formid,
						MatchType = FilterMatchType.Equals
					},
					new GetDataColumnFilterModel
					{
						ColNm = "ACCESSKBN",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.Checkbox,
						ColValFrom = searchData.Accesskbn
					}
				];
				DynamicParameters paramaters = new DynamicParameters();
				paramaters.Add("@USERNM", searchData.Usernm?.From ?? string.Empty);
				paramaters.Add("@LOGINUSERID", searchData.Userid);
				// Prepare the search parameters including query, filters, connection and transaction
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = con,
					DataTransaction = trans,
					DataQuery = CommonQuery.S_SET001_SELECT_1(),
					Parameters = paramaters,
					DataFilter = columns,
					Rows = searchData.Rows,
					Offset = searchData.Offset
				};

				// Execute the search using the repository and retrieve the result records
				dynamic response = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

				return response;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		/// <summary>
		/// To get the condition setting
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public dynamic GetSavedConditionSetting(ConditionSettingModel.Search searchData)
		{
			using var con = _dBContext.GetConnection();
			con.Open();

			using var trans = con.BeginTransaction();

			try
			{
				// Define the search filters to apply to the query
				List<GetDataColumnFilterModel> columns =
				[
                    // Filter by CONDITIONNO with an exact match
                    new GetDataColumnFilterModel
					{
						ColNm = "CONDITIONNO",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Conditionno.From,
						MatchType = FilterMatchType.Equals
					}
				];

				// Create the search parameters with connection, transaction, query, and filters
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = con,
					DataTransaction = trans,
					DataQuery = CommonQuery.S_SET002_SELECT_1(),
					DataFilter = columns,
				};

				// Perform the search using the repository and get the result set
				dynamic response = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

				return response;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		/// <summary>
		/// To delete condtion setting
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public string DeleteConditionSetting(ConditionSettingModel.Search searchData) /// jkbsj gfbsdfgsdj fbjgb
        {
            using var con = _dBContext.GetConnection();
            con.Open();

            using var trans = con.BeginTransaction();

            try
            {
                // Create a dynamic list to hold delete conditions
                List<dynamic> deleteList = [];

                // Add the CONDITIONNO from the search data to the delete list
                deleteList.Add(new
                {
                    CONDITIONNO = searchData.Conditionno?.From
                });

				//deleting data from S_SET002
				//List<SaveDataTableDetailModel> tableDetails =
				//[
				//	 new SaveDataTableDetailModel
				//	{
				//		TABLENAME = "S_SET002",
				//		 PRIMARYKEY = [
				//			("CONDITIONNO", "CONDITIONNO","1")
				//			],
				//		INSERTCOLUMN = [],
				//		UPDATECOLUMN = [],
				//		INSERTQUERY = null,
				//		INSERTQUERYPARAMS = null,
				//		UPDATEQUERY = null,
				//		UPDATEQUERYPARAMS = null,
				//		DELETEQUERY = null,
				//		DELETEQUERYPARAMS = null
				//	}
				//];

				// Prepare parameters for saving data (deleting here)
				var saveDataParams = new SaveDataParams<dynamic>
                {
                    Connection = con,
                    Transaction = trans,
                    //TableDetails = tableDetails,
                    InsertList = [],
                    UpdateList = [],
                    DeleteList = deleteList,
					DELETEQUERY = CommonQuery.S_SET002_DELETE_1(),
                    IgnoreUpdtdt = true,
                    Userid = "",
                    Programnm = "",
                };
                // Execute deletion on S_SET002
                string res = _saveDataRepo.SaveDataBase(saveDataParams);

                //deleting data from S_SET001
                //tableDetails =
                //[
                //     new SaveDataTableDetailModel
                //    {
                //        TABLENAME = "S_SET001",
                //        PRIMARYKEY = [
                //            ("CONDITIONNO", "CONDITIONNO","1"),
                //            ],
                //        INSERTCOLUMN = [],
                //        UPDATECOLUMN = [],
                //        INSERTQUERY = null,
                //        INSERTQUERYPARAMS = null,
                //        UPDATEQUERY = null,
                //        UPDATEQUERYPARAMS = null,
                //        DELETEQUERY = null,
                //        DELETEQUERYPARAMS = null
                //    }
                //];

                // Prepare save params for S_SET001
                saveDataParams = new SaveDataParams<dynamic>
                {
                    Connection = con,
                    Transaction = trans,
                   // TableDetails = tableDetails,
                    InsertList = [],
                    UpdateList = [],
                    DeleteList = deleteList,
					DELETEQUERY = CommonQuery.S_SET001_DELETE_1(),
                    IgnoreUpdtdt = true,
					Userid = "",
					Programnm = "",
				};
                // Execute deletion on S_SET001
                res = _saveDataRepo.SaveDataBase(saveDataParams);


                trans.Commit();

                return res;
            }
            catch (Exception ex)
            {
                trans.Rollback();
                throw;
            }
        }

		/// <summary>
		/// To save condition setting data
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		public dynamic SaveConditionSetting(ConditionSettingModel.Save saveData)
        {
            using var conn = _dBContext.GetConnection();
            conn.Open();

            using var trans = conn.BeginTransaction();

            try
            {
				List<S_SET001Model> InsertList_S_SET001 = [];
				List<S_SET001Model> UpdateList_S_SET001 = [];

				List<S_SET002Model> InsertList_S_SET002 = [];
				List<S_SET002Model> UpdateList_S_SET002 = [];

				string conditionno = "";

				if (!string.IsNullOrEmpty(saveData.Conditionno))
				{
					conditionno = saveData.Conditionno;
					UpdateList_S_SET001.Add(new()
					{
						Conditionno = new PropertyWrapper<string?> { Value = saveData.Conditionno },
						Conditionnm = new PropertyWrapper<string?> { Value = saveData.Conditionnm },
						formid = new PropertyWrapper<string?> { Value = saveData.Formid },
						userid = new PropertyWrapper<string?> { Value = saveData.Userid },
						accesskbn = new PropertyWrapper<string?> { Value = saveData.Accesskbn }
					});

					// If ColumnsData exists, update each column's data in S_SET002
					if (saveData.ColumnsData != null && saveData.ColumnsData.Count > 0)
					{
						for (int i = 0; i < saveData.ColumnsData.Count; i++)
						{
							UpdateList_S_SET002.Add(new S_SET002Model
							{
								Conditionno = new PropertyWrapper<string?> { Value = saveData.Conditionno },
								Columnname = new PropertyWrapper<string?> { Value = saveData.ColumnsData[i].Columnname },
								Visible = new PropertyWrapper<string?> { Value = saveData.ColumnsData[i].Visible },
								Fromvalue = new PropertyWrapper<string?>
								{
									Value = saveData.ColumnsData[i].Datatype == "3" &&
						!string.IsNullOrEmpty(saveData.ColumnsData[i].Fromvalue)
                            //? DateTime.Parse(saveData.ColumnsData[i].Fromvalue).ToString("yyyy/MM/dd")
                            ? DateTime.TryParseExact(
                                saveData.ColumnsData[i].Fromvalue,
                                "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz (zzzz)", // Format to match the input date string
                                CultureInfo.InvariantCulture,
                                DateTimeStyles.None,
                                out DateTime parsedFromDate)
                                ? parsedFromDate.ToString("yyyy/MM/dd")
                                : saveData.ColumnsData[i].Fromvalue
                            : saveData.ColumnsData[i].Fromvalue
								},
								Tovalue = new PropertyWrapper<string?>
								{
									Value = saveData.ColumnsData[i].Datatype == "3" &&
						!string.IsNullOrEmpty(saveData.ColumnsData[i].ToValue)
                            //? DateTime.Parse(saveData.ColumnsData[i].ToValue).ToString("yyyy/MM/dd")
                            ? DateTime.TryParseExact(
								saveData.ColumnsData[i].ToValue,
								"ddd MMM dd yyyy HH:mm:ss 'GMT'zzz (zzzz)", // Format to match the input date string
								CultureInfo.InvariantCulture,
								DateTimeStyles.None,
								out DateTime parsedToDate)
								? parsedToDate.ToString("yyyy/MM/dd")
								: saveData.ColumnsData[i].ToValue
                            : saveData.ColumnsData[i].ToValue
								},
								Combovalue = new PropertyWrapper<string?> { Value = saveData.ColumnsData[i].Combovalue },
								Checkvalue = new PropertyWrapper<string?> { Value = saveData.ColumnsData[i].Checkvalue }
							});
						}
					}
				}
				else
				{
					// generate a new conditionno
					conditionno = GetNextNo("COND_SETT", conn, trans);
					InsertList_S_SET001.Add(new()
					{
						Conditionno = new PropertyWrapper<string?> { Value = conditionno },
						Conditionnm = new PropertyWrapper<string?> { Value = saveData.Conditionnm },
						formid = new PropertyWrapper<string?> { Value = saveData.Formid },
						userid = new PropertyWrapper<string?> { Value = saveData.Userid },
						accesskbn = new PropertyWrapper<string?> { Value = saveData.Accesskbn }
					});

					// If ColumnsData exists, insert each column's data in S_SET002
					if (saveData.ColumnsData != null && saveData.ColumnsData.Count > 0)
					{
						for (int i = 0; i < saveData.ColumnsData.Count; i++)
						{
							var model = new S_SET002Model();
							
							model.Conditionno.Value = conditionno;
							model.Columnname.Value = saveData.ColumnsData[i].Columnname;
							model.Seq.Value = i;
							model.Visible.Value = saveData.ColumnsData[i].Visible;
							model.Fromvalue.Value = saveData.ColumnsData[i].Datatype == "3" &&
													!string.IsNullOrEmpty(saveData.ColumnsData[i].Fromvalue)
                                                    //? DateTime.Parse(saveData.ColumnsData[i].Fromvalue)
                                                    //          .ToString("yyyy/MM/dd")
													? DateTime.TryParseExact(
														saveData.ColumnsData[i].Fromvalue,
														"ddd MMM dd yyyy HH:mm:ss 'GMT'zzz (zzzz)", // Format to match the input date string
														CultureInfo.InvariantCulture,
														DateTimeStyles.None,
														out DateTime parsedFromDate)
														? parsedFromDate.ToString("yyyy/MM/dd")
														: saveData.ColumnsData[i].Fromvalue
													: saveData.ColumnsData[i].Fromvalue;
                            model.Tovalue.Value = saveData.ColumnsData[i].Datatype == "3" &&
												  !string.IsNullOrEmpty(saveData.ColumnsData[i].ToValue)
												  //? DateTime.Parse(saveData.ColumnsData[i].ToValue)
												  //          .ToString("yyyy/MM/dd")
												  ? DateTime.TryParseExact(
												  	saveData.ColumnsData[i].ToValue,
												  	"ddd MMM dd yyyy HH:mm:ss 'GMT'zzz (zzzz)", // Format to match the input date string
												  	CultureInfo.InvariantCulture,
												  	DateTimeStyles.None,
												  	out DateTime parsedToDate)
												  	? parsedToDate.ToString("yyyy/MM/dd")
												  	: saveData.ColumnsData[i].ToValue
												  : saveData.ColumnsData[i].ToValue;
							model.Combovalue.Value = saveData.ColumnsData[i].Combovalue;
							model.Checkvalue.Value = saveData.ColumnsData[i].Checkvalue;

							InsertList_S_SET002.Add(model);
						}
					}
				}

				SaveObj<S_SET001Model> saveData_S_SET001 = new()
				{
					AddList = InsertList_S_SET001,
					UpdateList = UpdateList_S_SET001,
					DeleteList = [],
					Userid = saveData.Userid,
					Formid = saveData.Formid,
					Programnm =	"",
				};

				string res = _s_set001Repository.SaveData(saveData_S_SET001, conn, trans,ignoreUpdtdt: true);


				SaveObj<S_SET002Model> saveData_S_SET002 = new()
				{
					AddList = InsertList_S_SET002,
					UpdateList = UpdateList_S_SET002,
					DeleteList = [],
					Userid = saveData.Userid,
					Formid = saveData.Formid,
					Programnm = "",
				};

				res = _s_set002Repository.SaveData(saveData_S_SET002, conn, trans, ignoreUpdtdt: true);

				trans.Commit();

                return new { res, conditionno };
            }
            catch(Exception ex)
            {
                trans.Rollback();
                throw;
            }
        }

		/// <summary>
		/// To get the last condition setting
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public dynamic GetLastConditionSetting(ConditionSettingModel.S_SET006 searchData)
		{
			// Open a database connection
			using var con = _dBContext.GetConnection();
			con.Open();

			using var trans = con.BeginTransaction();

			try
			{
				// Define the filter columns for the query
				List<GetDataColumnFilterModel> columns =
				[
					new GetDataColumnFilterModel
					{
						ColNm = "FORMID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Formid,
						MatchType = FilterMatchType.Equals
					},
					new GetDataColumnFilterModel
					{
						ColNm = "USERID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Userid,
						MatchType = FilterMatchType.Equals
					}
				];

				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = con,
					DataTransaction = trans,
					DataQuery = CommonQuery.S_SET006_SELECT_2(),
					DataFilter = columns,
				};

				dynamic response = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

				return response;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		/// <summary>
		/// To update the last conditionno
		/// </summary>
		/// <param name="saveData"></param>
		/// <returns></returns>
		public string UpdateLastConditionno(ConditionSettingModel.S_SET006 saveData)
        {
            // Open the database connection
            using var conn = _dBContext.GetConnection();
            conn.Open();

            // Initialize the result and lists for Insert and Update operations
            List<S_SET006Model> InsertList_S_SET006 = [];
            List<S_SET006Model> UpdateList_S_SET006 = [];

            using var transaction = conn.BeginTransaction();

            try
            {
                // Define the filter conditions to check if the data exists
                List<GetDataColumnFilterModel> GetDataFilter = [
                    new GetDataColumnFilterModel
                {
                    ColNm = "USERID",
                    ColDataType = ColumnDataType.String, // String type,
                    ColInputType = ColumnInputType.TextBox, // TextBox
                    ColValFrom = saveData.Userid,
                    MatchType = FilterMatchType.Equals // Equals
                },
                new GetDataColumnFilterModel
                {
                    ColNm = "FORMID",
                    ColDataType = ColumnDataType.String, // String type
                    ColInputType = ColumnInputType.TextBox, // TextBox
                    ColValFrom = saveData.Formid,
                    MatchType = FilterMatchType.Equals // Equals
                }
                ];

                // Set up the search parameters
                SearchDataBaseParam searchDataBaseParam = new()
                {
                    DataConnection = conn,
                    DataTransaction = transaction,
                    DataQuery = CommonQuery.S_SET006_SELECT_1(),
                    DataFilter = GetDataFilter,
                };

                // Execute the query and get the result
                dynamic data = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

                //If the data is found then update the data other wise insert the data into the S_SET006 table
                if (data.Count == 0)
                {
                    //Data to be inserted if no match is found
                    InsertList_S_SET006.Add(new()
                    {
                        Userid = new PropertyWrapper<string?> { Value = saveData?.Userid },
                        Formid = new PropertyWrapper<string?> { Value = saveData.Formid },
                        Last_conditionno = new PropertyWrapper<string?> { Value = saveData.Conditionno }
                    });
                }
                else
                {
                    // Data to be updated if a match is found
                    UpdateList_S_SET006.Add(new()
                    {
                        Userid = new PropertyWrapper<string?> { Value = saveData?.Userid },
                        Formid = new PropertyWrapper<string?> { Value = saveData.Formid },
                        Last_conditionno = new PropertyWrapper<string?> { Value = saveData.Conditionno }
                    });
                }

                SaveObj<S_SET006Model> saveData_S_SET006 = new()
                {
                    AddList = InsertList_S_SET006,
                    UpdateList = UpdateList_S_SET006,
                    DeleteList = [],
                    Userid = saveData.Userid,
                    Formid = saveData.Formid,
                    Programnm = "",
                };

                string res = _s_set006Repository.SaveData(saveData_S_SET006, conn, transaction, ignoreUpdtdt: true);
                transaction.Commit();

                return res;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw;
            }
        }

		/// <summary>
		/// To get height adjustment data
		/// </summary>
		/// <param name="searchData"></param>
		/// <returns></returns>
		public List<dynamic> Get_HeightAdjustmentData(AutomaticAdjustmentModel searchData)
		{
			using var conn = _dBContext.GetConnection();
			conn.Open();

			using var transaction = conn.BeginTransaction();
			try
			{
				// Define the filters to search for records in the S_SET003 table based on USERID and FORMID
				List<GetDataColumnFilterModel> GetDataFilter = [
					new GetDataColumnFilterModel
					{
						ColNm = "USERID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Userid,
						ColValTo = searchData.Userid,
						MatchType = FilterMatchType.Equals
					},
					new GetDataColumnFilterModel
					{
						ColNm = "FORMID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = searchData.Formid,
						ColValTo = searchData.Formid,
						MatchType = FilterMatchType.Equals
					}
				];

				// Set up the search parameters
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = transaction,
					DataQuery = CommonQuery.S_SET003_SELECT_1(),
					DataFilter = GetDataFilter,
				};

				// Execute the search query and get the data
				List<dynamic> data = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

				transaction.Commit();

				return data;
			}
			catch (Exception ex)
			{
				transaction.Rollback();
				throw;
			}
		}

        /// <summary>
        /// To save the height adjustment data
        /// </summary>
        /// <param name="saveList"></param>
        /// <returns></returns>
        public string Save_HeightAdjustmentData(AutomaticAdjustmentModel saveHeight)
        {
            // Open the database connection
            using var conn = _dBContext.GetConnection();
            conn.Open();

            using var transaction = conn.BeginTransaction();
            try
            {
                List<S_SET003Model> InsertList_S_SET003 = [];
                List<S_SET003Model> UpdateList_S_SET003 = [];
                List<S_SET003Model> DeleteList_S_SET003 = [];

                InsertList_S_SET003.Add(new()
                {
                    Userid = new PropertyWrapper<string?> { Value = saveHeight.Userid },
                    Formid = new PropertyWrapper<string?> { Value = saveHeight.Formid },
                    Pnlheightkbn = new PropertyWrapper<string?> { Value = saveHeight.Pnlheightkbn },
                });

				UpdateList_S_SET003.Add(new()
				{
					Userid = new PropertyWrapper<string?> { Value = saveHeight.Userid },
					Formid = new PropertyWrapper<string?> { Value = saveHeight.Formid },
					Pnlheightkbn = new PropertyWrapper<string?> { Value = saveHeight.Pnlheightkbn },
				});

				DeleteList_S_SET003.Add(new()
                {
                    Userid = new PropertyWrapper<string?> { Value = saveHeight.Userid },
                    Formid = new PropertyWrapper<string?> { Value = saveHeight.Formid },
                });

                SaveObj<S_SET003Model> saveData_S_SET003 = new()
                {
                    AddList = InsertList_S_SET003,
                    UpdateList = UpdateList_S_SET003,
                    DeleteList = DeleteList_S_SET003,
                    Userid = saveHeight.Userid,
                    Formid = saveHeight.Formid,
                    Programnm = "",
                };

                // Perform the insert or update operation
                string res = _s_set003Repository.SaveData(saveData_S_SET003, conn, transaction, ignoreUpdtdt: true);
                transaction.Commit();
                return res;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw;
            }
        }

        /// <summary>
        /// To get column meta data.
        /// </summary>
        /// <param name="connection"></param>
        /// <param name="transaction"></param>
        /// <returns></returns>
        public List<ColumnMetaDataModel> GetColumnMetaData(dynamic? connection, dynamic? transaction)
		{
			// If a connection is provided, use it. Otherwise, get a new connection from _dBContext
			var conn = (connection as IDbConnection) ?? _dBContext.GetConnection();

			// If the connection is not open, open it.
			if (conn.State != ConnectionState.Open)
			{
				conn.Open();
			}

			// If a transaction is provided, use it. Otherwise, begin a new transaction.
			var tran = (transaction as IDbTransaction) ?? conn.BeginTransaction();
			try
			{
				// Query to get column metadata from the database.
				string query = CommonQuery.TMES_COL_SIZE_INFO_SELECT_1();

				// Execute the query and map the results to a list of ColumnMetaData.
				return conn.Query<ColumnMetaDataModel>(query).ToList();
			}
			catch (Exception ex)
			{
				if (transaction == null) tran.Rollback();
				throw;
			}
			finally
			{
				if (connection == null) conn.Close();
			}
		}

		/// <summary>
		/// To get sorting data
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="FormId"></param>
		/// <returns></returns>
		public List<dynamic> GetSortingData(string UserId, string FormId)
		{
			using var conn = _dBContext.GetConnection();
			conn.Open();

			using var trans = conn.BeginTransaction();
			try
			{
				// Create a filter for UserId with exact match
				var userIdFilter = new GetDataColumnFilterModel
				{
					ColNm = "USERID",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = UserId,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Create filter for FormId (exact match)
				var formIdFilter = new GetDataColumnFilterModel
				{
					ColNm = "FORMID",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = FormId,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Prepare the search parameters for the database query
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = trans,
					DataQuery = CommonQuery.S_SET004_SELECT_1(),
					DataFilter = [userIdFilter, formIdFilter],
				};

				// Execute the query and retrieve the records
				List<dynamic> formSortData = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;
				trans.Commit();
				return formSortData;
			}
			catch (Exception ex)
			{
				trans.Rollback();
				throw;
			}
			finally
			{
				conn.Close();
			}
		}

		/// <summary>
		/// To save the sorting data
		/// </summary>
		/// <param name="SortData"></param>
		/// <returns></returns>
		 public string SaveSortingData(SortingDataModel.S_SET004 SortData)
		 {
			 using var conn = _dBContext.GetConnection();
			 conn.Open();

			 using var trans = conn.BeginTransaction();
			 try
			 {
                List<S_SET004Model> InsertList_S_SET004 = [];
                List<S_SET004Model> DeleteList_S_SET004 = [];

                InsertList_S_SET004.Add(new()
                {
                    Userid = new PropertyWrapper<string?> { Value = SortData.UserId },
                    Formid = new PropertyWrapper<string?> { Value = SortData.FormId },
                    Sortcolumn1 = new PropertyWrapper<string?> { Value = SortData.SortColumn1 },
                    Sortcolumn2 = new PropertyWrapper<string?> { Value = SortData.SortColumn2 },
                    Sortcolumn3 = new PropertyWrapper<string?> { Value = SortData.SortColumn3 },
                    Sortcolumn4 = new PropertyWrapper<string?> { Value = SortData.SortColumn4 },
                    Sortcolumn5 = new PropertyWrapper<string?> { Value = SortData.SortColumn5 },
					Asc1 = new PropertyWrapper<string?> { Value = SortData.Asc1.ToString() },
					Asc2 = new PropertyWrapper<string?> { Value = SortData.Asc2.ToString() },
					Asc3 = new PropertyWrapper<string?> { Value = SortData.Asc3.ToString() },
					Asc4 = new PropertyWrapper<string?> { Value = SortData.Asc4.ToString() },
					Asc5 = new PropertyWrapper<string?> { Value = SortData.Asc5.ToString() },


				});
				DeleteList_S_SET004.Add(new() {
					Userid = new PropertyWrapper<string?> {Value =SortData.UserId},
					Formid = new PropertyWrapper<string?> { Value =SortData.FormId},
				});

                SaveObj<S_SET004Model> saveData_S_SET004 = new()
                {
                    AddList = InsertList_S_SET004,
                    UpdateList = [],
                    DeleteList = DeleteList_S_SET004,
                    Userid = SortData.UserId,
                    Formid = SortData.FormId,
                    Programnm = "",
                };

                string res = _s_set004Repository.SaveData(saveData_S_SET004, conn, trans, ignoreUpdtdt: true);
				 trans.Commit();
				 return res;
			 }
			 catch (Exception ex)
			 {
				 trans.Rollback();
				 throw;
			 }
			 finally
			 {
				 conn.Close();
			 }
		 }

		/// <summary>
		/// To get the swap column data
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="FormId"></param>
		/// <returns></returns>
		public List<dynamic> GetSwapColumnData(string UserId, string FormId)
		{
			using var conn = _dBContext.GetConnection();
			conn.Open();

			using var trans = conn.BeginTransaction();
			try
			{
				// Create a filter for UserId with exact match
				var userIdFilter = new GetDataColumnFilterModel
				{
					ColNm = "USERID",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = UserId,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Create filter for FormId (exact match)
				var formIdFilter = new GetDataColumnFilterModel
				{
					ColNm = "FORMID",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = FormId,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Prepare parameters for search data
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = trans,
					DataQuery = CommonQuery.S_SET005_SELECT_1(), // pass the query
					DataFilter = new List<GetDataColumnFilterModel> { userIdFilter, formIdFilter }, //pass the userId and formID
				};

				// Execute the query and retrieve the records
				List<dynamic> formSwapData = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;
				trans.Commit();
				return formSwapData;
			}
			catch (Exception ex)
			{
				trans.Rollback();
				throw;
			}
			finally
			{
				conn.Close();
			}
		}

        /// <summary>
        /// To save the swap column data
        /// </summary>
        /// <param name="saveChangeData"></param>
        /// <returns></returns>
        public string SaveSwapColumnData(List<SwapColumnsModel> saveChangeData)
        {
            using var conn = _dBContext.GetConnection();
            conn.Open();


            // Start a transaction to ensure that the insert and delete operations are executed atomically.
            using var transaction = conn.BeginTransaction();
            try
            {
                List<S_SET005Model> InsertList_S_SET005 = [];
                List<S_SET005Model> DeleteList_S_SET005 = [];

                if (saveChangeData != null && saveChangeData.Count > 0)
                {
                    for (int i = 0; i < saveChangeData.Count; i++)
                    {
                        InsertList_S_SET005.Add(new()
                        {
                            Colnm = new PropertyWrapper<string?> { Value = saveChangeData[i].Colnm },
                            Dispcolno = new PropertyWrapper<int?> { Value = saveChangeData[i].Dispcolno },
                            Frozen = new PropertyWrapper<int?> { Value = saveChangeData[i].Frozen },
                            Colno = new PropertyWrapper<int?> { Value = saveChangeData[i].Colno },
                            Visible = new PropertyWrapper<int?> { Value = saveChangeData[i].Visible },
                            Userid = new PropertyWrapper<string?> { Value = saveChangeData[i].Userid },
                            Formid = new PropertyWrapper<string?> { Value = saveChangeData[i].Formid },
                        });
                    }
                }

                DeleteList_S_SET005.Add(new()
                {
                    Userid = new PropertyWrapper<string?> { Value = saveChangeData[0].Userid },
                    Formid = new PropertyWrapper<string?> { Value = saveChangeData[0].Formid },
                });

                SaveObj <S_SET005Model> saveData_S_SET005 = new()
                {
                    AddList = InsertList_S_SET005,
                    UpdateList = [],
                    DeleteList = DeleteList_S_SET005,
                    Userid = saveChangeData[0].Userid,
                    Formid = saveChangeData[0].Formid,
                    Programnm = "",
                };



                string res = _s_set005Repository.SaveData(saveData_S_SET005, conn, transaction, ignoreUpdtdt: true);
                transaction.Commit();

                return res;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw;
            }
        }

        /// <summary>
        /// To get row hidefilter for grid
        /// </summary>
        /// <param name="UserId"></param>
        /// <param name="FormId"></param>
        /// <returns></returns>
        public List<dynamic> Gethidefilterdata(string UserId, string FormId)
		{
			using var conn = _dBContext.GetConnection();
			conn.Open();

			using var tran = conn.BeginTransaction();
			try
			{
				// Create filter for USERID (exact match)
				List<GetDataColumnFilterModel> GetDataFilter = [
					new GetDataColumnFilterModel
					{
						ColNm = "USERID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = UserId,
						ColValTo = UserId,
						MatchType = FilterMatchType.Equals
					},
                    // Create filter for FORMID (exact match)
                    new GetDataColumnFilterModel
					{
						ColNm = "FORMID",
						ColDataType = ColumnDataType.String,
						ColInputType = ColumnInputType.TextBox,
						ColValFrom = FormId,
						ColValTo = FormId,
						MatchType = FilterMatchType.Equals
					}
				];

				// Prepare parameters for search data
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = tran,
					DataQuery = CommonQuery.S_SET007_SELECT_1(),
					DataFilter = GetDataFilter,
				};

				List<dynamic> data = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

				tran.Commit();

				return data;
			}
			catch (Exception ex)
			{
				tran.Rollback();
				throw;
			}
		}

		/// <summary>
		/// To save row hidefilter for grid
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="FormId"></param>
		/// <param name="Hidefilterkbn"></param>
		/// <returns></returns>
		/*public string Savehidefilterdata(string UserId, string FormId, string Hidefilterkbn)
        {
            using var conn = _dBContext.GetConnection();
            conn.Open();

            // Initialize response and lists for insert and delete operations.
            string res = "";
            List<dynamic> InsertList = [];
            List<dynamic> DeleteList = [];

            using var tran = conn.BeginTransaction();

            try
            {
                // Create filter for USERID (exact match)
                List<GetDataColumnFilterModel> getDataFilters = [
                new GetDataColumnFilterModel
                {
                    ColNm = "USERID",
                    ColDataType = "1",
                    ColInputType = "1",
                    ColValFrom = UserId,
                    ColValTo = UserId,
                    MatchType = "2"
                },
                // Create filter for FORMID (exact match)
                new GetDataColumnFilterModel
                {
                    ColNm = "FORMID",
                    ColDataType = "1",
                    ColInputType = "1",
                    ColValFrom = FormId,
                    ColValTo = FormId,
                    MatchType = "2"
                }
                ];

                SearchDataBaseParam searchDataBaseParam = new()
                {
                    DataConnection = conn,
                    DataTransaction = tran,
                    DataQuery = CommonQuery.S_SET007_SELECT_1(),
                    DataFilter = getDataFilters,
                };

                dynamic data = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;

                if (data != null)
                {
                    //delete list for delete the data according to userID and formID
                    DeleteList.Add(new
                    {
                        USERID = UserId,
                        FORMID = FormId,
                    });

                    //insert list for insert the data according to userID,formID and Hidefilterkbn
                    InsertList.Add(new
                    {
                        USERID = UserId,
                        FORMID = FormId,
                        HIDEFILTERKBN = Hidefilterkbn
                    });
                }

                // Define the details of the table and columns to be affected
                List<SaveDataTableDetailModel> tableDetails = [
                    new SaveDataTableDetailModel
                    {
                        TABLENAME = "S_SET007",
                        PRIMARYKEY = [("USERID", "USERID", "1"),("FORMID", "FORMID", "1")],
                        INSERTCOLUMN = [
                            ("USERID", "USERID","1"),
                            ("FORMID", "FORMID","1"),
                            ("HIDEFILTERKBN", "HIDEFILTERKBN","1")
                        ],
                        INSERTQUERY = null,
                        INSERTQUERYPARAMS = null,
                        UPDATECOLUMN = null,
                        UPDATEQUERY = null,
                        DELETEQUERY = null,
                        DELETEQUERYPARAMS = null

                    }
                ];

                // Set up the parameters needed to save data, including transaction and table details.
                var saveDataParams = new SaveDataParams<dynamic>
                {
                    Connection = conn,
                    Transaction = tran,
                    TableDetails = tableDetails,
                    InsertList = InsertList,
                    DeleteList = DeleteList,
                    UpdateList = [],
                    IgnoreUpdtdt = true,
					Userid = "",
					Programnm = "",
				};

                //call the ISaveDataBaseRepository
                res = _saveDataRepo.SaveDataBase(saveDataParams);

                tran.Commit();

                return res;
            }
            catch (Exception ex)
            {
                tran.Rollback();
                throw;
            }
        }*/

		public List<dynamic> GetReferenceSetting(ReferenceModel.S_SET008 data)
		{
			using var conn = _dBContext.GetConnection();
			conn.Open();

			using var trans = conn.BeginTransaction();
			try
			{
				// Create a filter for UserId with exact match
				var userIdFilter = new GetDataColumnFilterModel
				{
					ColNm = "USERID",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = data.USERID,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Create filter for FormId (exact match)
				var formIdFilter = new GetDataColumnFilterModel
				{
					ColNm = "FORMID",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = data.FORMID,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Create filter for TableName (exact match)
				var tableNameFilter = new GetDataColumnFilterModel
				{
					ColNm = "TABLENAME",
					ColDataType = ColumnDataType.String, // String type
					ColInputType = ColumnInputType.TextBox, // TextBox
					ColValFrom = data.TABLENAME,
					MatchType = FilterMatchType.Equals, // Equals
					MatchCase = true // Case sensitive match
				};

				// Prepare the search parameters for the database query
				SearchDataBaseParam searchDataBaseParam = new()
				{
					DataConnection = conn,
					DataTransaction = trans,
					DataQuery = CommonQuery.S_SET008_SELECT_1(),
					DataFilter = [userIdFilter, formIdFilter, tableNameFilter],
				};

				// Execute the query and retrieve the records
				List<dynamic> formSortData = _searchDataRepository.SearchDataBase(searchDataBaseParam).Records;
				trans.Commit();
				return formSortData;
			}
			catch (Exception ex)
			{
				trans.Rollback();
				throw;
			}
			finally
			{
				conn.Close();
			}
		}
		/*public string SaveReferenceSetting(ReferenceModel.S_SET008 data)
        {
            using var conn = _dBContext.GetConnection();
            conn.Open();

            using var trans = conn.BeginTransaction();
            try
            {
                // Define the details of the table and columns to be affected
                List<SaveDataTableDetailModel> tableDetails =
                [
                    new SaveDataTableDetailModel
            {
                TABLENAME = "S_SET008",
                PRIMARYKEY = [("USERID", "USERID", "1"), ("FORMID", "FORMID", "1"), ("TABLENAME", "TABLENAME", "1")],
                INSERTCOLUMN =
                [
                    ("USERID", "USERID","1"),
                    ("FORMID", "FORMID","1"),
                    ("TABLENAME", "TABLENAME","1"),
                    ("INITIALSEARCHKBN", "INITIALSEARCHKBN","1")
                ],
                UPDATECOLUMN = [],
                INSERTQUERY = null,
                INSERTQUERYPARAMS = null,
                UPDATEQUERY = null,
                UPDATEQUERYPARAMS = null,
                DELETEQUERY = null,
                DELETEQUERYPARAMS = null
            }
                ];

                // Always delete first and insert after
                var saveDataParams = new SaveDataParams<dynamic>
                {
                    Connection = conn,
                    Transaction = trans,
                    TableDetails = tableDetails,
                    InsertList = [data],
                    UpdateList = [],
                    DeleteList = [data],
                    IgnoreUpdtdt = true,
					Userid = "",
					Programnm = "",
				};

                string res = _saveDataRepo.SaveDataBase(saveDataParams);
                trans.Commit();
                return res;
            }
            catch (Exception ex)
            {
                trans.Rollback();
                throw;
            }
            finally
            {
                conn.Close();
            }
        }*/

		public int VerifyRefreshToken(string userId, string refreshToken, int idleTimeMins)
		{
			using var conn = _dBContext.GetConnection();
			try
			{
				// Define the SQL query to retrieve the user data based on the credentials
				string sql = CommonQuery.S_AUTH001_SELECT_1();
				// Define the parameters for the SQL query
				var parames = new
				{
					userid = userId,
					refreshtoken = refreshToken,
					idletimemins = idleTimeMins
				};

				// Execute the query and retrieve the first result
				int res = conn.QueryFirstOrDefault<int>(sql, parames);

				// Return the retrieved user data
				return res;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		public void UpdateLastActivity(string userId, dynamic? connection, dynamic? transaction)
		{
			// If a connection is provided, use it. Otherwise, get a new connection from _dBContext
			DbConnection conn = (connection as DbConnection) ?? _dBContext.GetConnection();

			// If the connection is not open, open it.
			if (conn.State != ConnectionState.Open)
			{
				conn.Open();
			}

			// If a transaction is provided, use it. Otherwise, begin a new transaction.
			var tran = (transaction as DbTransaction) ?? conn.BeginTransaction();
			try
			{

				S_AUTH001Model s_AUTH001Model = new S_AUTH001Model();
				s_AUTH001Model.Userid.Value = userId;

				SaveObj<S_AUTH001Model> s_AUTH001SaveData = new();
				s_AUTH001SaveData.UpdateList = [s_AUTH001Model];
				_s_AUTH001Repository.SaveData1(ignoreUpdtdt: true, connection: conn, transaction: tran, saveData: s_AUTH001SaveData);


				if (transaction == null) tran.Commit();
			}
			catch (Exception ex)
			{
				if (transaction == null) tran.Rollback();
				throw;
			}
			finally
			{
				if (connection == null) conn.Close();
			}
		}

		public string[] FileDataGet(string folderPath)
		{
			try
			{
				if (!Directory.Exists(folderPath))
				{
					throw new AppException(MessageCodes.FileNotExists, null, "Folder not found :" + folderPath);
				}
				string[] files = Directory.GetFiles(folderPath);
				string[] fileNames = files.Select(Path.GetFileName).ToArray();

				return fileNames;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		public int FileUpload(BaseModel.FileUploadDownloadModel fileUplodeData)
		{
			try
			{
				var directoryPath = fileUplodeData.PhysicalPath ?? string.Empty;
				if (!Directory.Exists(directoryPath))
				{
					Directory.CreateDirectory(directoryPath);
				}

				var filePath = Path.Combine(directoryPath, fileUplodeData.File.FileName);
				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					fileUplodeData.File.CopyTo(stream); // Synchronous version
				}
				return 200;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		public int FileDelete(BaseModel.FileUploadDownloadModel fileDeleteData)
		{
			try
			{
				var directoryPath = fileDeleteData.PhysicalPath ?? string.Empty;
				if (!Directory.Exists(directoryPath))
				{
					throw new AppException(MessageCodes.FileNotExists, null, "Folder not found :" + directoryPath);
				}

				var filePath = Path.Combine(fileDeleteData.PhysicalPath ?? "", fileDeleteData.FileName ?? "");
				if (File.Exists(filePath))
				{
					File.Delete(filePath);
				}
				return 200;
			}
			catch (Exception ex)
			{
				throw;
			}
		}

		public FileStreamResult FileDownload(BaseModel.FileUploadDownloadModel fileDownloadData)
		{
			try
			{
				var filePath = Path.Combine(fileDownloadData.PhysicalPath ?? "", fileDownloadData.FileName ?? "");
				if (!File.Exists(filePath))
				{
					throw new AppException(MessageCodes.FileNotExists, null, "File not found :" + filePath);
				}

				// Create and return FileStreamResult
				var memory = new MemoryStream();
				using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
				{
					stream.CopyTo(memory);
				}
				memory.Position = 0;

				var contentType = "application/octet-stream";
				return new FileStreamResult(memory, contentType)
				{
					FileDownloadName = Path.GetFileName(filePath) // Extract just the file name for download
				};
			}
			catch (Exception ex)
			{
				throw;
			}
		}
	}
}
