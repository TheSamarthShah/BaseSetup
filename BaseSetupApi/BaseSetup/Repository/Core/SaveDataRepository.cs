using Dapper;
using Newtonsoft.Json;
using BaseSetup.Common.Util;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Data.Common;
using System.Reflection;
using System.Text.RegularExpressions;

namespace BaseSetup.Repository.Core
{
    public class SaveDataParams<T>
    {
        public required DbConnection Connection { get; set; }
        public required DbTransaction Transaction { get; set; }
        //A list of table details that represent the structure and information needed for saving data.
        //public List<SaveDataTableDetailModel> TableDetails { get; set; }
        public List<T> InsertList { get; set; }
        public List<T> UpdateList { get; set; }
        public List<T> DeleteList { get; set; }

		public string? INSERTQUERY { get; set; }
		public string? UPDATEQUERY { get; set; }
		public string? DELETEQUERY { get; set; }

		// By default false. Means if Updtdt property in model is present then it will try to use it.
		// If needed to ignore the Updtdt prop even if it is present in model then set it true.
		public bool IgnoreUpdtdt { get; set; } = false;
		public required string Userid { get; set; }
		public required string Programnm { get; set; }
	}

    public class SaveDataRepository<T> : ISaveDataRepository<T>
    {
        /// <summary>
        /// Common data-saving method that generates dynamic insert, update, and delete queries based on the provided list
        /// </summary>
        /// <param name="saveDataParams"></param>
        /// <returns></returns>
        public string SaveDataBase(SaveDataParams<T> saveDataParams)
        {

			//set clientinfo
			if (!string.IsNullOrEmpty(saveDataParams.Userid) && !string.IsNullOrEmpty(saveDataParams.Programnm))
			{
				string plsql = @"BEGIN 
                                    DBMS_APPLICATION_INFO.SET_CLIENT_INFO(:clientInfo); 
                                END;";

				var fullClientInfo = $"{saveDataParams.Userid},{saveDataParams.Programnm}";

				var parameters = new DynamicParameters();
				parameters.Add("clientInfo", fullClientInfo, DbType.String);

				saveDataParams.Connection.Execute(plsql, parameters, transaction: saveDataParams.Transaction, commandType: CommandType.Text);
			}

			string InsertQuery = "";
			string UpdateQuery = "";
			string DeleteQuery = "";

			bool isDynamic = IsDynamicType(typeof(T));

			if (isDynamic)
			{
                // DELETE
                if (saveDataParams.DeleteList.Count > 0)
				{
					if (string.IsNullOrEmpty(saveDataParams.DELETEQUERY))
						throw new Exception("DELETEQUERY must be provided for dynamic types.");

					DeleteQuery = saveDataParams.DELETEQUERY;

					var requiredParams = ExtractQueryParams(DeleteQuery);
                    var firstRow = saveDataParams.DeleteList[0]!;
                    var dict = firstRow.GetType()
					.GetProperties()
					.ToDictionary(
						prop => prop.Name,
						prop => prop.GetValue(firstRow)
					);
                    var missingParams = requiredParams.Where(p => !dict.ContainsKey(p)).ToList();
					if (missingParams.Count > 0)
						throw new Exception($"DELETE query requires missing parameters: {string.Join(", ", missingParams)}");
				}

				// INSERT
				if (saveDataParams.InsertList.Count > 0)
				{
					if (string.IsNullOrEmpty(saveDataParams.INSERTQUERY))
						throw new Exception("INSERTQUERY must be provided for dynamic types.");

					InsertQuery = saveDataParams.INSERTQUERY;

					var requiredParams = ExtractQueryParams(InsertQuery);
                    var firstRow = saveDataParams.InsertList[0]!;
                    var dict = firstRow.GetType()
					.GetProperties()
					.ToDictionary(
						prop => prop.Name,
                         //prop.GetValue(firstRow)
                        prop => {
                            var val = prop.GetValue(firstRow);

                            // If value is null, return DBNull
                            if (val == null)
                                return DBNull.Value;
                           
                            return val;
                        }

                    );

                    var missingParams = requiredParams.Where(p => !dict.ContainsKey(p)).ToList();
					if (missingParams.Count > 0)
						throw new Exception($"INSERT query requires missing parameters: {string.Join(", ", missingParams)}");
				}

				// UPDATE
				if (saveDataParams.UpdateList.Count > 0)
				{
					if (string.IsNullOrEmpty(saveDataParams.UPDATEQUERY))
						throw new Exception("UPDATEQUERY must be provided for dynamic types.");

					UpdateQuery = saveDataParams.UPDATEQUERY;

					var requiredParams = ExtractQueryParams(UpdateQuery);
                    var firstRow = saveDataParams.UpdateList[0]!;
                    var dict = firstRow.GetType()
					.GetProperties()
					.ToDictionary(
						prop => prop.Name,
						prop => prop.GetValue(firstRow)
					);

                    var missingParams = requiredParams.Where(p => !dict.ContainsKey(p)).ToList();
					if (missingParams.Count > 0)
						throw new Exception($"UPDATE query requires missing parameters: {string.Join(", ", missingParams)}");
				}

				// --- Execute for dynamic ---
				foreach (T row in saveDataParams.DeleteList)
				{
                    var dict = row.GetType()
					.GetProperties()
					.ToDictionary(
						prop => prop.Name,
						prop => prop.GetValue(row)
					);
                    var parameters = new DynamicParameters();
					foreach (var kvp in dict) parameters.Add($":{kvp.Key}", kvp.Value);
					saveDataParams.Connection.Execute(DeleteQuery, parameters, saveDataParams.Transaction);
				}

				foreach (T row in saveDataParams.InsertList)
				{
                    var dict = row.GetType()
                    .GetProperties()
                    .ToDictionary(
                        prop => prop.Name,
                        prop => prop.GetValue(row)
                    );
                    var parameters = new DynamicParameters();
					foreach (var kvp in dict) parameters.Add($":{kvp.Key}", kvp.Value);
					saveDataParams.Connection.Execute(InsertQuery, parameters, saveDataParams.Transaction);
				}

				foreach (T row in saveDataParams.UpdateList)
				{
                    var dict = row.GetType()
					.GetProperties()
					.ToDictionary(
									prop => prop.Name,
									prop => prop.GetValue(row)
					);
                    var parameters = new DynamicParameters();
					foreach (var kvp in dict) parameters.Add($":{kvp.Key}", kvp.Value);
					saveDataParams.Connection.Execute(UpdateQuery, parameters, saveDataParams.Transaction);
				}

				return "SUCCESS";
			}

			#region Initial Checks
			// Check for Updtdt prop
			var updtdtProp = typeof(T).GetProperty("Updtdt");

			// check concurrency requirement
			if (!saveDataParams.IgnoreUpdtdt && updtdtProp == null)
				throw new Exception($"Concurrency check failed: model '{typeof(T).Name}' does not contain an exact 'Updtdt' property.");

			#endregion Initial Checks

            // Insert rows which already exists. Matched based on primary key
            var duplicatePkInsertRows = new Dictionary<string, List<Dictionary<string, object>>>();

			var tableName = typeof(T).GetCustomAttribute<TableAttribute>()?.Name?? typeof(T).Name;

			var keyProps = typeof(T).GetProperties().Where(p => Attribute.IsDefined(p, typeof(KeyAttribute))).ToList();

            // ---- DELETE ----
            if (saveDataParams.DeleteList.Count > 0) {
                // get the set properties based on the first row
                List<string> setProps = CommonUtil.GetSetProperties<T>(saveDataParams.DeleteList[0]);

                // select/make the query to use
                if (!String.IsNullOrEmpty(saveDataParams.DELETEQUERY))
                {
                    DeleteQuery = saveDataParams.DELETEQUERY;

					// check for all the params is set for the query
					var requiredParams = ExtractQueryParams(DeleteQuery);

					var missingParams = requiredParams
						.Where(p => !setProps.Contains(p))
						.ToList();

					if (missingParams.Count > 0)
					{
						throw new Exception(
							$"DELETE query requires the following parameters to be set in the DeleteList: {string.Join(", ", missingParams)}"
						);
					}
				}
				else
				{
					// Build list of required key props (PKs + Updtdt if concurrency is required)
					var requiredProps = keyProps.ToList();
					if (!saveDataParams.IgnoreUpdtdt && updtdtProp != null)
					{
						requiredProps.Add(updtdtProp);
					}

					// Ensure all required props are set
					var missingProps = requiredProps
						.Where(p => !setProps.Contains(p.Name))
						.Select(p => p.Name)
						.ToList();

					if (missingProps.Count > 0)
					{
						throw new Exception(
							$"DELETE requires the following key property/properties to be set: {string.Join(", ", missingProps)}"
						);
					}

					// Build default DELETE query
					var whereParts = keyProps.Select(k =>
						k.PropertyType == typeof(DateTime) || k.PropertyType == typeof(DateTimeOffset)
							? $"{k.Name} = TO_DATE(TO_CHAR(:{k.Name}, '{Constants.DateFormatSQL}'), '{Constants.DateFormatSQL}')"
							: $"{k.Name} = :{k.Name}"
					).ToList();

					if (!saveDataParams.IgnoreUpdtdt && updtdtProp != null)
					{
						whereParts.Add(
							$"UPDTDT = TO_DATE(TO_CHAR(:Updtdt, '{Constants.DateFormatSQL}'), '{Constants.DateFormatSQL}')"
						);
					}

					DeleteQuery = $"DELETE FROM {tableName} WHERE {string.Join(" AND ", whereParts)}";
				}
			}

			// ---- UPDATE ----
			if (saveDataParams.UpdateList.Count > 0)
			{
				// get the set properties based on the first row
				List<string> setProps = CommonUtil.GetSetProperties<T>(saveDataParams.UpdateList[0]);

				// select/make the query to use
				if (!string.IsNullOrEmpty(saveDataParams.UPDATEQUERY))
				{
					UpdateQuery = saveDataParams.UPDATEQUERY;

					// check for all the params are set for the query
					var requiredParams = ExtractQueryParams(UpdateQuery);

					var missingParams = requiredParams
						.Where(p => !setProps.Contains(p))
						.ToList();

					if (missingParams.Count > 0)
					{
						throw new Exception(
							$"UPDATE query requires the following parameters to be set in the UpdateList: {string.Join(", ", missingParams)}"
						);
					}
				}
				else
				{
					// Build list of required key props (PKs + Updtdt if concurrency is required)
					var requiredProps = keyProps.ToList();
					if (!saveDataParams.IgnoreUpdtdt && updtdtProp != null)
					{
						requiredProps.Add(updtdtProp);
					}

					// Ensure all required props are set
					var missingProps = requiredProps
						.Where(p => !setProps.Contains(p.Name))
						.Select(p => p.Name)
						.ToList();

					if (missingProps.Count > 0)
					{
						throw new Exception(
							$"UPDATE requires the following key property/properties to be set: {string.Join(", ", missingProps)}"
						);
					}

					// Ensure there are non-key properties to update
					var updateProps = setProps.Except(requiredProps.Select(p => p.Name)).ToList();
					if (updateProps.Count == 0)
					{
						throw new Exception("UPDATE requires at least one non-key property to update.");
					}

					// Build default UPDATE query
					var setParts = updateProps.Select(p => $"{p} = :{p}").ToList();

					var whereParts = keyProps.Select(k =>
						k.PropertyType == typeof(DateTime) || k.PropertyType == typeof(DateTimeOffset)
							? $"{k.Name} = TO_DATE(TO_CHAR(:{k.Name}, '{Constants.DateFormatSQL}'), '{Constants.DateFormatSQL}')"
							: $"{k.Name} = :{k.Name}"
					).ToList();

					if (!saveDataParams.IgnoreUpdtdt && updtdtProp != null)
					{
						whereParts.Add(
							$"UPDTDT = TO_DATE(TO_CHAR(:Updtdt, '{Constants.DateFormatSQL}'), '{Constants.DateFormatSQL}')"
						);
					}

					UpdateQuery = $"UPDATE {tableName} SET {string.Join(", ", setParts)} WHERE {string.Join(" AND ", whereParts)}";
				}
			}

			// ---- INSERT ----
			if (saveDataParams.InsertList.Count > 0)
			{
				// get the set properties based on the first row
				List<string> setProps = CommonUtil.GetSetProperties<T>(saveDataParams.InsertList[0]);

				// select/make the query to use
				if (!string.IsNullOrEmpty(saveDataParams.INSERTQUERY))
				{
					InsertQuery = saveDataParams.INSERTQUERY;

					// check for all the params are set for the query
					var requiredParams = ExtractQueryParams(InsertQuery);

					var missingParams = requiredParams
						.Where(p => !setProps.Contains(p))
						.ToList();

					if (missingParams.Count > 0)
					{
						throw new Exception(
							$"INSERT query requires the following parameters to be set in the InsertList: {string.Join(", ", missingParams)}"
						);
					}
				}
				else
				{
					// All insertable properties are the set properties (PKs + other fields)
					var insertProps = setProps;

					if (insertProps.Count == 0)
					{
						throw new Exception("INSERT requires at least one property to be set.");
					}

					// Build default INSERT query
					var columnNames = insertProps;
					var paramNames = insertProps.Select(p => $":{p}").ToList();

					InsertQuery = $"INSERT INTO {tableName} ({string.Join(", ", columnNames)}) VALUES ({string.Join(", ", paramNames)})";
				}
			}

			// ---- Execute DELETE ----
			if (saveDataParams.DeleteList.Count > 0)
			{
				foreach (var row in saveDataParams.DeleteList)
				{
					var parameters = new DynamicParameters();

					// Map all set properties into parameters
					var setProps = CommonUtil.GetSetProperties(row);
					foreach (var propName in setProps)
					{
						var prop = typeof(T).GetProperty(propName);
						var value = CommonUtil.GetPropertyValue(prop?.GetValue(row));
						parameters.Add($":{propName}", value);
					}

					// Add Updtdt separately if concurrency check is required
					if (!saveDataParams.IgnoreUpdtdt && updtdtProp != null)
					{
						var rawUpdtdt = updtdtProp.GetValue(row, null);
						var updtdtValue = CommonUtil.GetPropertyValue(rawUpdtdt);
						parameters.Add(":Updtdt", updtdtValue);
					}

					// Execute the DELETE command
					int affectedRows = saveDataParams.Connection.Execute(DeleteQuery, parameters, saveDataParams.Transaction);

					// If no rows were deleted, assume concurrency conflict (UPDTDT mismatch)
					if (affectedRows == 0 && !saveDataParams.IgnoreUpdtdt)
					{
						string pkInfo = string.Join(", ", keyProps.Select(k =>
						{
							var rawValue = k.GetValue(row);
							var value = CommonUtil.GetPropertyValue(rawValue);
							return $"{k.Name}={value}";
						}));

						string message = $"The row in table '{tableName}' with key [{pkInfo}] has been modified by someone else.";

						throw new AppException(MessageCodes.RowModified, null, message);
					}
				}
			}


			// ---- Execute INSERT ----
			if (saveDataParams.InsertList.Count > 0)
			{
				foreach (var row in saveDataParams.InsertList)
				{
					var parameters = new DynamicParameters();

					// get set props for this row
					var setProps = CommonUtil.GetSetProperties(row);

					// --- Duplicate PK check ---
					if (keyProps.Count > 0)
					{
						var whereConditions = new List<string>();
						var whereParams = new DynamicParameters();

						foreach (var pk in keyProps)
						{
							var value = CommonUtil.GetPropertyValue(pk.GetValue(row));

							if (pk.PropertyType == typeof(DateTime) || pk.PropertyType == typeof(DateTimeOffset))
							{
								whereConditions.Add($"{pk.Name} = TO_DATE(TO_CHAR(:{pk.Name}, '{Constants.DateFormatSQL}'), '{Constants.DateFormatSQL}')");
							}
							else
							{
								whereConditions.Add($"{pk.Name} = :{pk.Name}");
							}

							whereParams.Add($":{pk.Name}", value);
						}

						string checkQuery = $"SELECT 1 FROM {tableName} WHERE {string.Join(" AND ", whereConditions)}";
						var exists = saveDataParams.Connection.ExecuteScalar<int?>(checkQuery, whereParams, saveDataParams.Transaction);

						if (exists.HasValue)
						{
							var primaryKeyData = keyProps.ToDictionary(
								pk => pk.Name,
								pk => CommonUtil.GetPropertyValue(pk.GetValue(row))
							);

							if (!duplicatePkInsertRows.ContainsKey(tableName))
								duplicatePkInsertRows[tableName] = new List<Dictionary<string, object>>();

							duplicatePkInsertRows[tableName].Add(primaryKeyData);

							// skip inserting this row
							continue;
						}
					}

					// --- Map parameters from setProps ---
					foreach (var propName in setProps)
					{
						var prop = typeof(T).GetProperty(propName);
						var value = CommonUtil.GetPropertyValue(prop?.GetValue(row));
						parameters.Add($":{propName}", value);
					}

					// --- Execute the INSERT ---
					saveDataParams.Connection.Execute(InsertQuery, parameters, saveDataParams.Transaction);
				}

				// if duplicates found, throw once after loop
				if (duplicatePkInsertRows.Count > 0)
				{
					string duplicatePkJson = JsonConvert.SerializeObject(duplicatePkInsertRows);

					throw new AppException(
						MessageCodes.RowAlreadyExists,
						duplicatePkInsertRows,
						$"List of inserting rows already exists: {duplicatePkJson}"
					);
				}
			}


			// ---- UPDATE ----
			if (saveDataParams.UpdateList.Count > 0)
			{
				foreach (var row in saveDataParams.UpdateList)
				{
					// Use the already-prepared UpdateQuery (custom or default)
					string query = UpdateQuery!;
					List<string> setProps = CommonUtil.GetSetProperties(row);

					// Validate all parameters required by the query are present in setProps
					var requiredParams = ExtractQueryParams(query)
						.Where(p => p != "Updtdt") // Updtdt handled separately
						.ToList();

					var missingParams = requiredParams
						.Where(p => !setProps.Contains(p))
						.ToList();

					if (missingParams.Count > 0)
					{
						throw new Exception(
							$"UPDATE query requires the following parameters to be set in the UpdateList: {string.Join(", ", missingParams)}"
						);
					}

					// Map row properties to query parameters
					var parameters = new DynamicParameters();
					foreach (var propName in setProps)
					{
						if (propName == "Updtdt") continue; // add separately if needed

						var prop = row!.GetType().GetProperty(propName);
						var rawValue = prop?.GetValue(row, null);
						var value = CommonUtil.GetPropertyValue(rawValue);
						parameters.Add($":{propName}", value);
					}

					// Add Updtdt explicitly if concurrency is enabled
					if (!saveDataParams.IgnoreUpdtdt && updtdtProp != null)
					{
						var rawUpdtdt = updtdtProp.GetValue(row, null);
						var updtdtValue = CommonUtil.GetPropertyValue(rawUpdtdt);
						parameters.Add(":Updtdt", updtdtValue);
					}

					// Execute the UPDATE
					int affectedRows = saveDataParams.Connection.Execute(query, parameters, saveDataParams.Transaction);

					// Concurrency check: if nothing updated and Updtdt required → throw
					if (affectedRows == 0 && !saveDataParams.IgnoreUpdtdt && keyProps.Any())
					{
						string pkInfo = string.Join(", ", keyProps.Select(pk =>
						{
							var rawValue = pk.GetValue(row, null);
							var value = CommonUtil.GetPropertyValue(rawValue);
							return $"{pk.Name}={value}";
						}));

						string message = $"The row in table '{tableName}' with key [{pkInfo}] has been modified by someone else.";
						throw new AppException(MessageCodes.RowModified, null, message);
					}
				}
			}


			// Return HTTP OK status as string
			return "SUCCESS";
        }

		private List<string> ExtractQueryParams(string sql)
		{
			// Remove string literals to avoid false positives like :MI and :SS from TO_DATE or other literals
			string _query = Regex.Replace(sql, @"'[^']*'", string.Empty);

			return Regex.Matches(_query, @":(\w+)")
				.Cast<Match>()
				.Select(m => m.Groups[1].Value)
				.Distinct()
				.ToList();
		}

		private bool IsDynamicType(Type type) =>
			type == typeof(object) || type == typeof(System.Dynamic.ExpandoObject) || typeof(System.Collections.IDictionary).IsAssignableFrom(type);
	}
}
