using Dapper;
using System.Data.Common;
using System.Text.RegularExpressions;
using BaseSetup.Model.Core;

namespace BaseSetup.Repository.Core
{
    public class SaveDataParams<TGrid>
    {
        public required DbConnection Connection { get; set; }
        public required DbTransaction Transaction { get; set; }
        //A list of table details that represent the structure and information needed for saving data.
        public required List<SaveData_TableDetail> TableDetails { get; set; }
        public List<TGrid> InsertList { get; set; }
        public List<TGrid> UpdateList { get; set; }
        public List<TGrid> DeleteList { get; set; }
    }

    public class SaveDataRepository<TGrid> : ISaveDataRepository<TGrid>
    {
        /// <summary>
        /// Common data-saving method that generates dynamic insert, update, and delete queries based on the provided list
        /// </summary>
        /// <param name="saveDataParams"></param>
        /// <returns></returns>
        public string SaveDataBase(SaveDataParams<TGrid> saveDataParams)
        {
            // Dictionaries to hold dynamically constructed queries per table
            Dictionary<string, string> InsertQueries = new();
            Dictionary<string, string> UpdateQueries = new();
            Dictionary<string, string> DeleteQueries = new();

            // Generate queries for each table detail
            foreach (var tableDetail in saveDataParams.TableDetails)
            {
                string? table = tableDetail.TABLENAME;
                if (string.IsNullOrWhiteSpace(table))
                    continue;

                // Build INSERT query if not provided
                if (!string.IsNullOrWhiteSpace(tableDetail.INSERTQUERY))
                {
                    InsertQueries[table] = tableDetail.INSERTQUERY;
                }
                else if (tableDetail.INSERTCOLUMN != null && tableDetail.INSERTCOLUMN.Count != 0)
                {
                    // Construct INSERT query using column list
                    string query = $"INSERT INTO {table} ({string.Join(", ", tableDetail.INSERTCOLUMN.Select(x => x.Item1))}) VALUES ({string.Join(", ", tableDetail.INSERTCOLUMN.Select(x => $":{x.Item1}"))})";
                    InsertQueries[table] = query;
                }

                // Build UPDATE query if not provided
                if (!string.IsNullOrWhiteSpace(tableDetail.UPDATEQUERY))
                {
                    UpdateQueries[table] = tableDetail.UPDATEQUERY;
                }
                else if (tableDetail.UPDATECOLUMN != null && tableDetail.UPDATECOLUMN.Count != 0)
                {
                    // Construct UPDATE query using SET and optional WHERE clause
                    string setClause = string.Join(", ", tableDetail.UPDATECOLUMN.Select(x => $"{x.Item1} = :{x.Item1}"));
                    string whereClause = (tableDetail.PRIMARYKEY != null && tableDetail.PRIMARYKEY.Count != 0) ? " WHERE " + string.Join(" AND ", tableDetail.PRIMARYKEY.Select(pk => $"{pk.Item1} = :{pk.Item1}")) : "";
                    string query = $"UPDATE {table} SET {setClause}{whereClause}";
                    UpdateQueries[table] = query;
                }

                // Build DELETE query if not provided
                if (!string.IsNullOrWhiteSpace(tableDetail.DELETEQUERY))
                {
                    DeleteQueries[table] = tableDetail.DELETEQUERY;
                }
                else if (tableDetail.PRIMARYKEY != null && tableDetail.PRIMARYKEY.Count != 0)
                {
                    // Construct DELETE query using WHERE clause based on primary key
                    string whereClause = " WHERE " + string.Join(" AND ", tableDetail.PRIMARYKEY.Select(pk => $"{pk.Item1} = :{pk.Item1}"));
                    string query = $"DELETE FROM {table}{whereClause}";
                    DeleteQueries[table] = query;
                }
            }

            // Execute DELETE queries for all rows in DeleteList
            foreach (var row in saveDataParams.DeleteList)
            {
                foreach (var tableDetail in saveDataParams.TableDetails)
                {
                    if (string.IsNullOrWhiteSpace(tableDetail.TABLENAME))
                        continue;

                    string table = tableDetail.TABLENAME!;
                    if (!DeleteQueries.ContainsKey(table))
                        continue;

                    string query = DeleteQueries[table];
                    List<(string, string)> queryParams = tableDetail.DELETEQUERYPARAMS ?? tableDetail.PRIMARYKEY ?? new List<(string, string)>();

                    //  Validate all required parameters exist in query
                    if (!QueryValidation(query, queryParams, out List<string> missingParams))
                    {
                        throw new Exception($"DELETE query for table '{table}' is missing parameters: {string.Join(", ", missingParams)}");
                    }

                    // Map row properties to query parameters
                    var parameters = new DynamicParameters();
                    foreach (var param in queryParams)
                    {
                        string dbColumn = param.Item1;
                        string modelProperty = param.Item2;
                        var value = row.GetType().GetProperty(modelProperty)?.GetValue(row, null);
                        parameters.Add($":{dbColumn}", value);
                    }

                    // Execute the DELETE command
                    saveDataParams.Connection.Execute(query, parameters, saveDataParams.Transaction);
                }
            }

            // Execute INSERT queries for all rows in InsertList
            foreach (var row in saveDataParams.InsertList)
            {
                foreach (var tableDetail in saveDataParams.TableDetails)
                {
                    if (string.IsNullOrWhiteSpace(tableDetail.TABLENAME))
                        continue;

                    string table = tableDetail.TABLENAME!;
                    if (!InsertQueries.ContainsKey(table))
                        continue;

                    string query = InsertQueries[table];
                    List<(string, string)> queryParams = tableDetail.INSERTQUERYPARAMS ?? tableDetail.INSERTCOLUMN?.ToList() ?? new List<(string, string)>();

                    // Validate required parameters
                    if (!QueryValidation(query, queryParams, out List<string> missingParams))
                    {
                        throw new Exception($"INSERT query for table '{table}' is missing parameters: {string.Join(", ", missingParams)}");
                    }

                    // Map row properties to query parameters
                    var parameters = new DynamicParameters();
                    foreach (var param in queryParams)
                    {
                        string dbColumn = param.Item1;
                        string modelProperty = param.Item2;
                        var value = row.GetType().GetProperty(modelProperty)?.GetValue(row, null);
                        parameters.Add($":{dbColumn}", value);
                    }

                    // Execute the INSERT command
                    saveDataParams.Connection.Execute(query, parameters, saveDataParams.Transaction);
                }
            }

            // Execute UPDATE queries for all rows in UpdateList
            foreach (var row in saveDataParams.UpdateList)
            {
                foreach (var tableDetail in saveDataParams.TableDetails)
                {
                    if (string.IsNullOrWhiteSpace(tableDetail.TABLENAME))
                        continue;

                    string table = tableDetail.TABLENAME!;
                    if (!UpdateQueries.ContainsKey(table))
                        continue;

                    string query = UpdateQueries[table];
                    // Combine parameters from UPDATEQUERYPARAMS, UPDATECOLUMN, and PRIMARYKEY
                    List<(string, string)> queryParams = (tableDetail.UPDATEQUERYPARAMS ?? new List<(string, string)>())
                                                         .Concat(tableDetail.UPDATECOLUMN ?? new List<(string, string)>())
                                                         .Concat(tableDetail.PRIMARYKEY ?? new List<(string, string)>())
                                                         .ToList();

                    // Validate parameters in the query
                    if (!QueryValidation(query, queryParams, out List<string> missingParams))
                    {
                        throw new Exception($"UPDATE query for table '{table}' is missing parameters: {string.Join(", ", missingParams)}");
                    }

                    // Map row properties to query parameters
                    var parameters = new DynamicParameters();
                    foreach (var param in queryParams)
                    {
                        string dbColumn = param.Item1;
                        string modelProperty = param.Item2;
                        var value = row.GetType().GetProperty(modelProperty)?.GetValue(row, null);
                        parameters.Add($":{dbColumn}", value);
                    }

                    // Execute the UPDATE command
                    saveDataParams.Connection.Execute(query, parameters, saveDataParams.Transaction);
                }
            }

            // Return HTTP OK status as string
            return "200";
        }

        /// <summary>
        /// Method to validate that all query parameters exist
        /// </summary>
        /// <param name="query"></param>
        /// <param name="queryParams"></param>
        /// <param name="missingParams"></param>
        /// <returns></returns>
        private bool QueryValidation(string query, List<(string, string)> queryParams, out List<string> missingParams)
        {
            // Extract parameters from query (e.g., :Id, :Name, :Age)
            var paramMatches = Regex.Matches(query, @":(\w+)");
            HashSet<string> queryParamNames = paramMatches.Select(m => m.Groups[1].Value).ToHashSet();

            // Extract provided parameter names from queryParams
            HashSet<string> providedParams = queryParams.Select(p => p.Item1).ToHashSet();

            // Find missing parameters
            missingParams = queryParamNames.Except(providedParams).ToList();

            return missingParams.Count == 0;
        }
    }
}
