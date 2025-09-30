using Dapper;
using BaseSetup.Common.Util;
using BaseSetup.Context;
using BaseSetup.Model.Core;
using BaseSetup.Model.Page.Common;
using System.Data.Common;
using System.Numerics;
using System.Text;
using System.Text.RegularExpressions;

namespace BaseSetup.Repository.Core
{

    public class SearchDataBaseParam
    {
        public DbConnection DataConnection { get; set; }
        public DbTransaction DataTransaction { get; set; }
        public string DataQuery { get; set; }
		public DynamicParameters? Parameters { get; set; }
		//A list of column filters to apply on the data during the query execution
		public List<GetDataColumnFilterModel> DataFilter { get; set; }
        //The offset (pagination) for data retrieval, used to skip a certain number of rows
        public int? Offset { get; set; }
        //The number of rows to return in the query result (pagination)
        public int? Rows { get; set; }
        public string? UserId { get; set; }
        public string? FormId { get; set; }
    }

    /// <summary>
    /// search data method return type
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class SearchResponse<T>
    {
        //This is return the total number of data
        public int? TotalData { get; set; }
        //This is return the total retrive data
        public List<T> Records { get; set; }
		public QueryParameters? query { get; set; }
	}

	public class QueryParameters
	{
		public string Sql { get; set; } = string.Empty;
		public DynamicParameters Parameters { get; set; } = new DynamicParameters();
	}

	public class SearchDataRepository<T>(IDBContext dBContext) : ISearchDataRepository<T>
    {
		private readonly IDBContext _dbContext = dBContext;

        /// <summary>
        /// To search the data based on the provided search parameters.
        /// </summary>
        /// <param name="searchDataBaseParam"></param>
        /// <returns></returns>
        public SearchResponse<T> SearchDataBase(SearchDataBaseParam searchDataBaseParam, Boolean shouldExecuteQuery = true)
        {
			string parameterPrefix = _dbContext.ParameterPrefix + (!shouldExecuteQuery ? "ne" : "");

			string sql = searchDataBaseParam.DataQuery;

			// Normalize SQL: replace multiple whitespaces/newlines/tabs with a single space
			sql = Regex.Replace(sql, @"\s+", " ");

			// Split the SQL string into individual queries and capture the set operators used between them
			var (queries, operators) = SplitOnSetOperators(sql);

			// Extract clause parts for each individual query
            //list of all the clause of all queries
			var results = new List<Dictionary<string, string>>();
			foreach (var query in queries)
			{
				results.Add(ExtractParts(query));
			}

			DynamicParameters parameters = searchDataBaseParam.Parameters ?? new();

			if (searchDataBaseParam.DataFilter != null && searchDataBaseParam.DataFilter.Count > 0)
            {
                foreach (var filter in searchDataBaseParam.DataFilter)
                {
                    // Only process filter if column name is provided and has valid filter values or special match types
                    if (
                        !string.IsNullOrEmpty(filter.ColNm) && 
                        (                          
                            !string.IsNullOrEmpty(filter.ColValFrom) || 
                            !string.IsNullOrEmpty(filter.ColValTo) ||                           
                            filter.MatchType == FilterMatchType.IsBlank || 
                            filter.MatchType == FilterMatchType.IsNotBlank
						)
                    )
                    {
                        // Handle different column types
                        if (filter.ColInputType == ColumnInputType.TextBox)
                        {
                            dynamic? fromVal = null;
                            dynamic? toVal = null;

                            // Parse values based on column data type
                            if (filter.ColDataType == ColumnDataType.String || filter.ColDataType == ColumnDataType.Date) // String or Date
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom))  fromVal = filter.ColValFrom;
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = filter.ColValTo;
                            }
                            else if(filter.ColDataType == ColumnDataType.Int) // Integer
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = int.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = int.Parse(filter.ColValTo);
                            }
                            else if(filter.ColDataType == ColumnDataType.Long) // Long
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = long.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = long.Parse(filter.ColValTo);
                            }
                            else if(filter.ColDataType == ColumnDataType.BigInt) // BigInteger
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = BigInteger.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = BigInteger.Parse(filter.ColValTo);
                            }
                            else if(filter.ColDataType == ColumnDataType.Decimal) // Decimal
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = decimal.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = decimal.Parse(filter.ColValTo);
                            }

                            // Process filter if we have valid values
                            // if filter.MatchType == RANGE then check both From and To value, else only check From value
                            if (
                                    (
                                        filter.MatchType == FilterMatchType.Like &&
                                        (
                                            !string.IsNullOrEmpty(Convert.ToString(fromVal)) || 
                                            !string.IsNullOrEmpty(Convert.ToString(toVal))
                                        )
                                    ) ||
                                    (
                                        filter.MatchType != FilterMatchType.Like &&
                                        !string.IsNullOrEmpty(Convert.ToString(fromVal))
                                    )
                                )
                            {
								string fromParamName = $"{parameterPrefix}p_{filter.ColNm}_From";
								string fromLowerParamName = $"{parameterPrefix}p_{filter.ColNm}_From_Lower";
								string toParamName = $"{parameterPrefix}p_{filter.ColNm}_To";

								parameters.Add(fromParamName, fromVal);
								parameters.Add(fromLowerParamName, Convert.ToString(fromVal).ToLower());
								parameters.Add(toParamName, toVal);

								// Handle different match types
								if (filter.MatchType == FilterMatchType.Like) // Range filter (between)
                                {
                                    if (
                                        !string.IsNullOrEmpty(Convert.ToString(fromVal)) && 
                                        !string.IsNullOrEmpty(Convert.ToString(toVal)) && 
                                        filter.ColNms != null && 
                                        filter.ColNms.Count > 0
                                    )
                                    {
                                        // Build OR conditions for multiple columns
                                        
                                        string compareCondFrom = " >= ";
                                        string compareCondTo = " <= ";

										string colValueFrom = (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? "TO_DATE(" : "") + fromParamName + (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? ",'" + Constants.DateFormatSQL + "')" : "");
                                        string colValueTo = (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? "TO_DATE(" : "") + toParamName + (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? ",'" + Constants.DateFormatSQL + "')" : "");

                                        foreach(var result in results)
                                        {
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{												
												//get actual name of column used in select sql
												orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + compareCondFrom + colValueFrom + " AND " + GetExpressionByAlias(result["SELECT"], colNm) + compareCondTo + colValueTo;
												orAppend = " OR ";
											}

                                            if (result["WHERE"] != "")
                                            {
                                                result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
                                            else
                                            {
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
                                    }
                                    else
                                    {
                                        // Handle single column range filter
                                        if (!string.IsNullOrEmpty(Convert.ToString(fromVal)))
                                        {
                                            string compareCond = " >= ";
                                            string colValue = (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? "TO_DATE(" : "") + fromParamName + (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? ",'" + Constants.DateFormatSQL + "')" : "");
                                            if (filter.ColNms != null && filter.ColNms.Count > 0)
                                            {
												foreach (var result in results)
												{
													string orConditions = "";
													string orAppend = "";

													foreach (string colNm in filter.ColNms)
													{
														//get actual name of column used in select sql
														orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + compareCond + colValue;
														orAppend = " OR ";
													}

													if (result["WHERE"] != "")
													{
														result["WHERE"] += " AND " + "(" + orConditions + ")";
													}
													else
													{
														result["WHERE"] += " WHERE " + "(" + orConditions + ")";
													}
												}				
                                            }
                                            else
                                            {
												foreach (var result in results)
												{
													// Single column condition
													string colNmQuery = GetExpressionByAlias(result["SELECT"], filter.ColNm);

													if (result["WHERE"] != "")
													{
														result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
													}
													else
													{
														result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
													}
												}
											}
                                        }
                                        if (!string.IsNullOrEmpty(Convert.ToString(toVal)))
                                        {
                                            // Similar logic for upper bound of range
                                            string compareCond = " <= ";
                                            string colValue = (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? "TO_DATE(" : "") + toParamName + (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? ",'" + Constants.DateFormatSQL + "')" : "");

                                            if (filter.ColNms != null && filter.ColNms.Count > 0)
                                            {
												foreach (var result in results)
												{
													string orConditions = "";
													string orAppend = "";

													foreach (string colNm in filter.ColNms)
													{
														//get actual name of column used in select sql
														orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + compareCond + colValue;
														orAppend = " OR ";
													}

													if (result["WHERE"] != "")
													{
														result["WHERE"] += " AND " + "(" + orConditions + ")";
													}
													else
													{
														result["WHERE"] += " WHERE " + "(" + orConditions + ")";
													}
												}
											}
                                            else
                                            {
												foreach (var result in results)
												{
													// Single column condition
													string colNmQuery = GetExpressionByAlias(result["SELECT"], filter.ColNm);

													if (result["WHERE"] != "")
													{
														result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
													}
													else
													{
														result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
													}
												}
											}
                                        }
                                    }
                                }
								else if (filter.MatchType == FilterMatchType.Equals) // Exact match
								{
                                    string compareCond = " = ";
                                    string colValue = (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? "TO_DATE(" : "") + fromParamName + (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? ",'" + Constants.DateFormatSQL + "')" : "");

                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
                                    else
                                    {
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = GetExpressionByAlias(result["SELECT"], filter.ColNm);

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
                                }
								else if (filter.MatchType == FilterMatchType.NotEquals) // Not equal
								{
                                    // Similar to exact match but with <> operator
                                    string compareCond = " <> ";
                                    string colValue = (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? "TO_DATE(" : "") + fromParamName + (filter.ColDataType == ColumnDataType.String ? "" : filter.ColDataType == ColumnDataType.Date ? ",'" + Constants.DateFormatSQL + "')" : "");

									if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
									{
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
									else
									{
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = GetExpressionByAlias(result["SELECT"], filter.ColNm);

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
								}
								else if (filter.MatchType == FilterMatchType.StartsWith) // Starts with
								{
                                    string compareCond = " LIKE ";
                                    string colValue = (filter.MatchCase == false ? fromLowerParamName : fromParamName) + " || '%'";
                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], colNm) + (filter.MatchCase == false ? ")" : "");
												orConditions += orAppend + colNmQuery + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
                                    else
                                    {
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], filter.ColNm) + (filter.MatchCase == false ? ")" : "");

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
                                }
								else if (filter.MatchType == FilterMatchType.NotStartsWith)  // Not starts with
								{
                                    string compareCond = " NOT LIKE ";
                                    string colValue = (filter.MatchCase == false ? fromLowerParamName : fromParamName) + " || '%'";

									if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
									{
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], colNm) + (filter.MatchCase == false ? ")" : "");
												orConditions += orAppend + colNmQuery + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
									else
									{
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], filter.ColNm) + (filter.MatchCase == false ? ")" : "");

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
								}
								else if (filter.MatchType == FilterMatchType.EndsWith) // Ends with
								{
                                    string compareCond = " LIKE ";
                                    string colValue = "'%' || " + (filter.MatchCase == false ? fromLowerParamName : fromParamName);

									if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
									{
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], colNm) + (filter.MatchCase == false ? ")" : "");
												orConditions += orAppend + colNmQuery + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
									else
									{
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], filter.ColNm) + (filter.MatchCase == false ? ")" : "");

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
								}
								else if (filter.MatchType == FilterMatchType.NotEndsWith) // Not ends with
								{
                                    string compareCond = " NOT LIKE ";
                                    string colValue = "'%' || " + (filter.MatchCase == false ? fromLowerParamName : fromParamName);

									if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
									{
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], colNm) + (filter.MatchCase == false ? ")" : "");
												orConditions += orAppend + colNmQuery + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
									else
									{
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], filter.ColNm) + (filter.MatchCase == false ? ")" : "");

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
								}
								else if (filter.MatchType == FilterMatchType.Contains) // Contains
								{
                                    string compareCond = " LIKE ";
                                    string colValue = "'%' || " + (filter.MatchCase == false ? fromLowerParamName : fromParamName) + " || '%'";

									if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
									{
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], colNm) + (filter.MatchCase == false ? ")" : "");
												orConditions += orAppend + colNmQuery + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
									else
									{
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], filter.ColNm) + (filter.MatchCase == false ? ")" : "");

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
								}
								else if (filter.MatchType == FilterMatchType.NotContains) // Not contains
								{
                                    string compareCond = " NOT LIKE ";
                                    string colValue = "'%' || " + (filter.MatchCase == false ? fromLowerParamName : fromParamName) + " || '%'";

									if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
									{
										foreach (var result in results)
										{
											string orConditions = "";
											string orAppend = "";

											foreach (string colNm in filter.ColNms)
											{
												//get actual name of column used in select sql
												string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], colNm) + (filter.MatchCase == false ? ")" : "");
												orConditions += orAppend + colNmQuery + compareCond + colValue;
												orAppend = " OR ";
											}

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + "(" + orConditions + ")";
											}
											else
											{
												result["WHERE"] += " WHERE " + "(" + orConditions + ")";
											}
										}
									}
									else
									{
										foreach (var result in results)
										{
											// Single column condition
											string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + GetExpressionByAlias(result["SELECT"], filter.ColNm) + (filter.MatchCase == false ? ")" : "");

											if (result["WHERE"] != "")
											{
												result["WHERE"] += " AND " + colNmQuery + compareCond + colValue;
											}
											else
											{
												result["WHERE"] += " WHERE " + colNmQuery + compareCond + colValue;
											}
										}
									}
								}
                            }
							if (filter.MatchType == FilterMatchType.IsBlank) // IS NULL
							{
                                if (filter.ColNms != null && filter.ColNms.Count > 0)  //Multiple column condition
                                {
									foreach (var result in results)
									{
										string orConditions = "";
										string orAppend = "";

										foreach (string colNm in filter.ColNms)
										{
											//get actual name of column used in select sql
											orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + " IS NULL";
											orAppend = " OR ";
										}

										if (result["WHERE"] != "")
										{
											result["WHERE"] += " AND " + "(" + orConditions + ")";
										}
										else
										{
											result["WHERE"] += " WHERE " + "(" + orConditions + ")";
										}
									}
								}
                                else
                                {
									foreach (var result in results)
									{
										// Single column condition
										if (result["WHERE"] != "")
										{
											result["WHERE"] += " AND " + GetExpressionByAlias(result["SELECT"], filter.ColNm) + " IS NULL";
										}
										else
										{
											result["WHERE"] += " WHERE " + GetExpressionByAlias(result["SELECT"], filter.ColNm) + " IS NULL";
										}
									}
								}
                            }
                            else if (filter.MatchType == FilterMatchType.IsNotBlank)
							{
								if (filter.ColNms != null && filter.ColNms.Count > 0)  //Multiple column condition
								{
									foreach (var result in results)
									{
										string orConditions = "";
										string orAppend = "";

										foreach (string colNm in filter.ColNms)
										{
											//get actual name of column used in select sql
											orConditions += orAppend + GetExpressionByAlias(result["SELECT"], colNm) + " IS NOT NULL";
											orAppend = " OR ";
										}

										if (result["WHERE"] != "")
										{
											result["WHERE"] += " AND " + "(" + orConditions + ")";
										}
										else
										{
											result["WHERE"] += " WHERE " + "(" + orConditions + ")";
										}
									}
								}
								else
								{
									foreach (var result in results)
									{
										// Single column condition
										if (result["WHERE"] != "")
										{
											result["WHERE"] += " AND " + GetExpressionByAlias(result["SELECT"], filter.ColNm) + " IS NOT NULL";
										}
										else
										{
											result["WHERE"] += " WHERE " + GetExpressionByAlias(result["SELECT"], filter.ColNm) + " IS NOT NULL";
										}
									}
								}
							}
                        }
						else if (filter.ColInputType == ColumnInputType.Checkbox) // IN clause filter
						{
							if (!string.IsNullOrEmpty(filter.ColValFrom))
							{
								// Remove single quotes and split by comma
								var values = filter.ColValFrom.Replace("'", "")
									.Split(',')
									.Select(v => v.Trim())
									.Where(v => !string.IsNullOrEmpty(v))
									.ToArray();

								if (values.Length > 0)
								{
									// Create individual parameters for each value
									var paramNames = new List<string>();
									for (int i = 0; i < values.Length; i++)
									{
										string paramName = $"{parameterPrefix}p_{filter.ColNm}_From_{i}";
										parameters.Add(paramName, values[i]);
										paramNames.Add(paramName);
									}

									string inClause = string.Join(", ", paramNames);

									foreach (var result in results)
									{
										string whereClause = $"{GetExpressionByAlias(result["SELECT"], filter.ColNm)} IN ({inClause})";

										if (!string.IsNullOrEmpty(result["WHERE"]?.ToString()))
										{
											result["WHERE"] += " AND " + whereClause;
										}
										else
										{
											result["WHERE"] = " WHERE " + whereClause;
										}
									}
								}
							}
						}
						else if(filter.ColInputType == ColumnInputType.Radio)
						{
							if (!string.IsNullOrEmpty(filter.ColValFrom))
							{
								string fromParamName = $"{parameterPrefix}p_{filter.ColNm}_From";
								parameters.Add(fromParamName, filter.ColValFrom);

								foreach (var result in results)
								{
									if (result["WHERE"] != "")
									{
										result["WHERE"] += " AND " + GetExpressionByAlias(result["SELECT"], filter.ColNm) + " = " + fromParamName;
									}
									else
									{
										result["WHERE"] += " WHERE " + GetExpressionByAlias(result["SELECT"], filter.ColNm) + " = " + fromParamName;
									}
								}
							}
						}
                    }
                }
            }

            //add order by part
            string sortTableOrderBy = "";
            if (!string.IsNullOrEmpty(searchDataBaseParam.UserId) && !string.IsNullOrEmpty(searchDataBaseParam.FormId))
            {
                // Query to get user's saved sorting preferences for this form
                string query = @"SELECT USERID,
                                        FORMID,
                                        SORTCOLUMN1,
                                        SORTCOLUMN2,
                                        SORTCOLUMN3,
                                        SORTCOLUMN4,
                                        SORTCOLUMN5,
                                        ASC1,
                                        ASC2,
                                        ASC3,
                                        ASC4,
                                        ASC5
                                 FROM   sc_main.S_SET004
                                 WHERE  USERID = :UserId
                                 AND    FORMID = :FormId";

                SortingDataModel.S_SET004? formSortdata = searchDataBaseParam.DataConnection
                    .Query<SortingDataModel.S_SET004>(query, new { UserId = searchDataBaseParam.UserId, FormId = searchDataBaseParam.FormId })
                    .FirstOrDefault();


                if (formSortdata != null)
                {
                    List<string> orderByClauses = new();

                    if (!string.IsNullOrEmpty(formSortdata.SortColumn1))
                        orderByClauses.Add($"{formSortdata.SortColumn1} {(formSortdata.Asc1 == '0' ? "ASC" : "DESC")}");

                    if (!string.IsNullOrEmpty(formSortdata.SortColumn2))
                        orderByClauses.Add($"{formSortdata.SortColumn2} {(formSortdata.Asc2 == '0' ? "ASC" : "DESC")}");

                    if (!string.IsNullOrEmpty(formSortdata.SortColumn3))
                        orderByClauses.Add($"{formSortdata.SortColumn3} {(formSortdata.Asc3 == '0' ? "ASC" : "DESC")}");

                    if (!string.IsNullOrEmpty(formSortdata.SortColumn4))
                        orderByClauses.Add($"{formSortdata.SortColumn4} {(formSortdata.Asc4 == '0' ? "ASC" : "DESC")}");

                    if (!string.IsNullOrEmpty(formSortdata.SortColumn5))
                        orderByClauses.Add($"{formSortdata.SortColumn5} {(formSortdata.Asc5 == '0' ? "ASC" : "DESC")}");

                    if (orderByClauses.Count > 0)
                    {
                        sortTableOrderBy = "ORDER BY " + string.Join(", ", orderByClauses);
                    }
                }
            }
            if (!string.IsNullOrEmpty(sortTableOrderBy))
            {
				results.Last()["ORDER BY"] = " " + sortTableOrderBy;  // Use custom user sorting
			}

			//merge whole query
			string mergedSql = ReconstructSQL(results, operators);

			if (!shouldExecuteQuery)
			{
				SearchResponse<T> res = new()
				{
					query = new()
					{
						Sql = mergedSql,
						Parameters = parameters
					},
				};

				return res;
			}

			//get totalDataCount
			string DataCntSql = $"SELECT COUNT(*) FROM ({mergedSql})";
			// Execute count query by combining count SQL with the filtered query (without ORDER BY) to get the total data count
			int DataCnt = searchDataBaseParam.DataConnection.Query<int>(DataCntSql,param: parameters).FirstOrDefault();

			// Apply pagination if parameters are provided
			if (searchDataBaseParam.Offset.HasValue && searchDataBaseParam.Rows.HasValue)
            {
				mergedSql += " " + "OFFSET " + searchDataBaseParam.Offset + " ROWS FETCH NEXT " + searchDataBaseParam.Rows + " ROWS ONLY ";
            }
            else if (searchDataBaseParam.Offset.HasValue)
            {
				// Only offset specified - get all rows after offset
				mergedSql += " " + "OFFSET " + searchDataBaseParam.Offset + " ROWS";
            }

			// Execute the final query to fetch the actual data with all filters, sorting and pagination applied
			var data = searchDataBaseParam.DataConnection.Query<T>(mergedSql, param: parameters).ToList();

            // Create and return response object containing:
            // - The paginated/filtered/sorted data records
            // - The total count of records
            SearchResponse<T> response = new()
            {
                Records = data,
                TotalData = DataCnt,
            };

            return response;
        }

		/// <summary>
		/// Extracts the original expression for a given alias from a SELECT clause.
		/// </summary>
		private string? GetExpressionByAlias(string selectClause, string aliasToFind)
		{
			// Remove the SELECT keyword if present
			selectClause = selectClause.Trim();
			if (selectClause.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
				selectClause = selectClause.Substring(6).Trim();

			var expressions = new List<string>();
			var current = "";
			int depth = 0;

			// Split expressions by commas that are not inside parentheses
			foreach (char c in selectClause)
			{
				if (c == ',' && depth == 0)
				{
					expressions.Add(current.Trim());
					current = "";
				}
				else
				{
					if (c == '(') depth++;
					else if (c == ')') depth--;
					current += c;
				}
			}
			if (!string.IsNullOrWhiteSpace(current))
				expressions.Add(current.Trim());

			// Analyze each expression to find the alias and corresponding expression
			foreach (var expr in expressions)
			{

				// Case 1: "expression AS alias"
				var match = Regex.Match(expr, @"(?i)^(.+?)\s+AS\s+(\w+)$");
				string alias;
				string expression;
				if (match.Success)
				{
					expression = match.Groups[1].Value.Trim();
					alias = match.Groups[2].Value.Trim();
				}
				else
				{
					// Case 2: "expression alias" (no AS)
					match = Regex.Match(expr, @"(?i)^(.+?)\s+(\w+)$");
					if (match.Success)
					{
						expression = match.Groups[1].Value.Trim();
						alias = match.Groups[2].Value.Trim();
					}
					else
					{
						// Case 3: No alias — assume full expression is both
						expression = expr.Trim();
						alias = expr.Trim().Split('.').Last(); // e.g., t1.name → name
					}
				}

				// Match found
				if (alias.Equals(aliasToFind, StringComparison.OrdinalIgnoreCase))
					return expression;
			}

			return aliasToFind; // No matching alias found
		}

		// Splits a SQL string on top-level set operators (UNION, UNION ALL, INTERSECT, EXCEPT)
		// Returns a tuple: list of query strings, and list of set operators between them
		private (List<string> queries, List<string> operators) SplitOnSetOperators(string sql)
		{
			var queries = new List<string>();
			var operators = new List<string>();

			// Supported set operators (longer ones first to avoid partial matches)
			var setOps = new[] { "UNION ALL", "UNION", "INTERSECT", "EXCEPT" };

			var matches = new List<(int Index, string Operator)>();
			int depth = 0; // Track parentheses depth to ignore operators inside subqueries

			for (int i = 0; i < sql.Length - 5; i++)
			{
				// Update parentheses depth counter
				if (sql[i] == '(') depth++;
				else if (sql[i] == ')') depth--;

				// Skip if inside parentheses (inside subquery)
				if (depth != 0) continue;

				// Check for any set operator at current position
				foreach (var op in setOps)
				{
					if (i + op.Length <= sql.Length &&
						string.Equals(sql.Substring(i, op.Length), op, StringComparison.OrdinalIgnoreCase))
					{
						matches.Add((i, op));
						break; // Avoid matching multiple operators starting at same index
					}
				}
			}

			int last = 0;
			foreach (var match in matches)
			{
				int length = match.Index - last;
				if (length < 0) length = 0; // Safety check

				// Extract query part before operator and trim whitespace
				queries.Add(sql.Substring(last, length).Trim());
				operators.Add(match.Operator.Trim().ToUpper());

				// Move past the operator for next substring
				last = match.Index + match.Operator.Length;
			}

			// Add the last query after the final operator
			if (last < sql.Length)
			{
				queries.Add(sql.Substring(last).Trim());
			}

			return (queries, operators);
		}

		// Extracts SQL clauses (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY) from a single query
		// Returns a dictionary where keys are clause names and values are clause contents (including keywords)
		private Dictionary<string, string> ExtractParts(string sql)
		{
			string[] clauses = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY"];
			var indexes = clauses.ToDictionary(c => c, c => -1); // Store start indexes of each clause

			int parenDepth = 0; // Track parentheses depth to ignore clauses inside subqueries
			for (int i = 0; i < sql.Length - 5; i++)
			{
				if (sql[i] == '(') parenDepth++;
				else if (sql[i] == ')') parenDepth--;

				if (parenDepth != 0) continue; // Skip inside parentheses

				// Find first occurrence of each clause at top level
				foreach (var clause in clauses)
				{
					if (sql.Substring(i).StartsWith(clause + " ", StringComparison.OrdinalIgnoreCase) && indexes[clause] == -1)
						indexes[clause] = i;
				}
			}

			var parts = new Dictionary<string, string>();

			// Extract substring for each clause from start to next clause start
			for (int i = 0; i < clauses.Length; i++)
			{
				string current = clauses[i];
				int start = indexes[current];

				if (start == -1)
				{
					parts[current] = ""; // Clause not found, assign empty string
					continue;
				}

				int end = sql.Length; // Default to end of string
									  // Find the next clause index that comes after current clause
				for (int j = i + 1; j < clauses.Length; j++)
				{
					int nextIndex = indexes[clauses[j]];
					if (nextIndex != -1 && nextIndex > start)
					{
						end = nextIndex;
						break;
					}
				}

				// Extract clause substring and trim whitespace
				parts[current] = sql.Substring(start, end - start).Trim();
			}

			return parts;
		}

		private string ReconstructSQL(List<Dictionary<string, string>> partsList, List<string> operators)
		{
			string[] clauseOrder = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY"];
			List<string> rebuiltQueries = [];

			foreach (var parts in partsList)
			{
				var sb = new List<string>();
				foreach (var clause in clauseOrder)
				{
					if (parts.TryGetValue(clause, out var content))
						sb.Add(content);
				}
				rebuiltQueries.Add(string.Join(" ", sb));
			}

			// Join the queries using set operators
			string finalSQL = rebuiltQueries[0];
			for (int i = 1; i < rebuiltQueries.Count; i++)
			{
				finalSQL += $" {operators[i - 1]} {rebuiltQueries[i]}";
			}

			return finalSQL;
		}

		public string ReplaceQueryParameters(QueryParameters query)
		{
			string sql = query.Sql;
			DynamicParameters parameters = query.Parameters;
			string parameterPrefix = _dbContext.ParameterPrefix;

			if (parameters == null || string.IsNullOrEmpty(sql))
				return sql;

			var result = new StringBuilder(sql);

			// Regex to extract :ParamName style placeholders
			Regex regex = new Regex($@"{parameterPrefix}(\w+)", RegexOptions.Compiled);

			MatchCollection matches = regex.Matches(sql);
			foreach (Match match in matches)
			{
				string fullParamName = match.Value;   // e.g. ":UserId"
				string paramName = match.Groups[1].Value; // e.g. "UserId"

				try
				{
					var value = parameters.Get<object>(paramName);
					if (value != null)
					{
						string replacement = FormatSqlValue(value);

						// Replace only this exact occurrence
						result.Replace(fullParamName, replacement);
					}
				}
				catch
				{
					// If parameter not found in DynamicParameters, skip
				}
			}

			return result.ToString();
		}

		private string FormatSqlValue(object value)
		{
			return $"'{value}'"; // wrap in quotes
		}
	}
}