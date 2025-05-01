using Dapper;
using System.Data.Common;
using System.Numerics;
using System.Text.RegularExpressions;
using BaseSetup.Common;
using BaseSetup.Model.Core;

namespace BaseSetup.Repository.Core
{

    public class SearchDataBaseParam
    {
        public DbConnection DataConnection { get; set; }
        public DbTransaction DataTransaction { get; set; }
        public string DataQuery { get; set; }
        //A list of column filters to apply on the data during the query execution
        public List<GetData_ColumnFilter> DataFilter { get; set; }
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
    }

    public class SearchDataRepository<T> : ISearchDataRepository<T>
    {
        /// <summary>
        /// To search the data based on the provided search parameters.
        /// </summary>
        /// <param name="searchDataBaseParam"></param>
        /// <returns></returns>
        public SearchResponse<T> SearchDataBase(SearchDataBaseParam searchDataBaseParam)
        {

            // Regular Expression to split the SQL Query
            string pattern = @"\b(FROM|ORDER BY)\b";  // Matches "FROM" or "ORDER BY"

            // Split query using Regex while keeping delimiters
            string[] parts = Regex.Split(searchDataBaseParam.DataQuery, pattern, RegexOptions.IgnoreCase);

            //split query here
            string DataSelectQuery = parts[0].Trim();  // Everything before FROM clause
            string DataFromQuery = parts.Length > 2 ? (parts[1] + " " + parts[2]).Trim() : ""; // FROM + its content
            string DataOrderBy = parts.Length > 4 ? (parts[3] + " " + parts[4]).Trim() : ""; // ORDER BY + its content

            // Initialize the base query with FROM clause (without SELECT part)
            string sql = DataFromQuery;

            //generate where part based on filter columns
            string strToAppend = sql.IndexOf("WHERE") > -1 ? " AND " : " WHERE ";

            if (searchDataBaseParam.DataFilter != null && searchDataBaseParam.DataFilter.Count > 0)
            {
                foreach (var filter in searchDataBaseParam.DataFilter)
                {
                    // Only process filter if column name is provided and has valid filter values or special match types
                    if (!string.IsNullOrEmpty(filter.ColNm) && ((!string.IsNullOrEmpty(filter.ColValFrom) || !string.IsNullOrEmpty(filter.ColValTo)) || (filter.MatchType == "10" || filter.MatchType == "11")))
                    {
                        // Handle different column types
                        if (filter.ColType == "1")
                        {
                            dynamic? fromVal = null;
                            dynamic? toVal = null;

                            // Parse values based on column data type
                            if (filter.ColDataType == "1" || filter.ColDataType == "6") // String or Date
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom))  fromVal = filter.ColValFrom;
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = filter.ColValTo;
                            }
                            else if(filter.ColDataType == "2") // Integer
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = int.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = int.Parse(filter.ColValTo);
                            }
                            else if(filter.ColDataType == "3") // Long
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = long.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = long.Parse(filter.ColValTo);
                            }
                            else if(filter.ColDataType == "4") // BigInteger
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = BigInteger.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = BigInteger.Parse(filter.ColValTo);
                            }
                            else if(filter.ColDataType == "5") // Decimal
                            {
                                if (!string.IsNullOrEmpty(filter.ColValFrom)) fromVal = decimal.Parse(filter.ColValFrom);
                                if (!string.IsNullOrEmpty(filter.ColValTo)) toVal = decimal.Parse(filter.ColValTo);
                            }

                            // Process filter if we have valid values
                            if (!string.IsNullOrEmpty(Convert.ToString(fromVal)) || !string.IsNullOrEmpty(Convert.ToString(toVal)))
                            {
                                // Handle different match types
                                if (filter.MatchType == "1") // Range filter (between)
                                {
                                    if (!string.IsNullOrEmpty(Convert.ToString(fromVal)) && !string.IsNullOrEmpty(Convert.ToString(toVal)) && filter.ColNms != null && filter.ColNms.Count > 0)
                                    {
                                        // Build OR conditions for multiple columns
                                        string orConditions = "";
                                        string orAppend = "";
                                        string compareCondFrom = " >= ";
                                        string compareCondTo = " <= ";
                                        string colValueFrom = (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "TO_DATE('" : "") + fromVal + (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "','" + Constants.DateFormatSQL + "')" : "");
                                        string colValueTo = (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "TO_DATE('" : "") + toVal + (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "','" + Constants.DateFormatSQL + "')" : "");
                                        foreach (string colNm in filter.ColNms)
                                        {
                                            orConditions += orAppend + colNm + compareCondFrom + colValueFrom + " AND " + colNm + compareCondTo + colValueTo;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Handle single column range filter
                                        if (!string.IsNullOrEmpty(Convert.ToString(fromVal)))
                                        {
                                            string compareCond = " >= ";
                                            string colValue = (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "TO_DATE('" : "") + fromVal + (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "','" + Constants.DateFormatSQL + "')" : "");
                                            if (filter.ColNms != null && filter.ColNms.Count > 0)
                                            {
                                                // Build OR conditions for multiple columns
                                                string orConditions = "";
                                                string orAppend = "";

                                                foreach (string colNm in filter.ColNms)
                                                {
                                                    orConditions += orAppend + colNm + compareCond + colValue;
                                                    orAppend = " OR ";
                                                }

                                                sql += strToAppend + "(" + orConditions + ")";
                                                strToAppend = " AND ";
                                            }
                                            else
                                            {
                                                // Single column condition
                                                string colNmQuery = filter.ColNm;
                                                sql += strToAppend + colNmQuery + compareCond + colValue;
                                                strToAppend = " AND ";
                                            }
                                        }
                                        if (!string.IsNullOrEmpty(Convert.ToString(toVal)))
                                        {
                                            // Similar logic for upper bound of range
                                            string compareCond = " <= ";
                                            string colValue = (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "TO_DATE('" : "") + toVal + (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "','" + Constants.DateFormatSQL + "')" : "");

                                            if (filter.ColNms != null && filter.ColNms.Count > 0)
                                            {
                                                string orConditions = "";
                                                string orAppend = "";

                                                foreach (string colNm in filter.ColNms)
                                                {
                                                    orConditions += orAppend + colNm + compareCond + colValue;
                                                    orAppend = " OR ";
                                                }

                                                sql += strToAppend + "(" + orConditions + ")";
                                                strToAppend = " AND ";
                                            }
                                            else
                                            {
                                                string colNmQuery = filter.ColNm;
                                                sql += strToAppend + colNmQuery + compareCond + colValue;
                                                strToAppend = " AND ";
                                            }
                                        }
                                    }
                                }
                                else if (filter.MatchType == "2") // Exact match
                                {
                                    string compareCond = " = ";
                                    string colValue = (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "TO_DATE('" : "") + fromVal + (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "','" + Constants.DateFormatSQL + "')" : "");

                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = colNm;
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = filter.ColNm;
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "3") // Not equal
                                {
                                    // Similar to exact match but with <> operator
                                    string compareCond = " <> ";
                                    string colValue = (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "TO_DATE('" : "") + fromVal + (filter.ColDataType == "1" ? "'" : filter.ColDataType == "6" ? "','" + Constants.DateFormatSQL + "')" : "");

                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = colNm;
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = filter.ColNm;
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "4") // Starts with
                                {
                                    string compareCond = " LIKE ";
                                    string colValue = "'" + (filter.MatchCase == false ? Convert.ToString(fromVal).ToLower() : fromVal) + "%'";
                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + colNm + (filter.MatchCase == false ? ")" : "");
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + filter.ColNm + (filter.MatchCase == false ? ")" : "");
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "5")  // Not starts with
                                {
                                    string compareCond = " NOT LIKE ";
                                    string colValue = "'" + (filter.MatchCase == false ? Convert.ToString(fromVal).ToLower() : fromVal) + "%'";

                                    if (filter.ColNms != null && filter.ColNms.Count > 0)//Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + colNm + (filter.MatchCase == false ? ")" : "");
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + filter.ColNm + (filter.MatchCase == false ? ")" : "");
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "6") // Ends with
                                {
                                    string compareCond = " LIKE ";
                                    string colValue = "'%" + (filter.MatchCase == false ? Convert.ToString(fromVal).ToLower() : fromVal) + "'";

                                    if (filter.ColNms != null && filter.ColNms.Count > 0)
                                    {
                                        string orConditions = "";
                                        string orAppend = "";
                                        // Single column condition
                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + colNm + (filter.MatchCase == false ? ")" : "");
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        //Multiple column condition
                                        string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + filter.ColNm + (filter.MatchCase == false ? ")" : "");
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "7") // Not ends with
                                {
                                    string compareCond = " NOT LIKE ";
                                    string colValue = "'%" + (filter.MatchCase == false ? Convert.ToString(fromVal).ToLower() : fromVal) + "'";

                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + colNm + (filter.MatchCase == false ? ")" : "");
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + filter.ColNm + (filter.MatchCase == false ? ")" : "");
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "8") // Contains
                                {
                                    string compareCond = " LIKE ";
                                    string colValue = "'%" + (filter.MatchCase == false ? Convert.ToString(fromVal).ToLower() : fromVal) + "%'";

                                    if (filter.ColNms != null && filter.ColNms.Count > 0) //Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + colNm + (filter.MatchCase == false ? ")" : "");
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + filter.ColNm + (filter.MatchCase == false ? ")" : "");
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                                else if (filter.MatchType == "9") // Not contains
                                {
                                    string compareCond = " NOT LIKE ";
                                    string colValue = "'%" + (filter.MatchCase == false ? Convert.ToString(fromVal).ToLower() : fromVal) + "%'";

                                    if (filter.ColNms != null && filter.ColNms.Count > 0)  //Multiple column condition
                                    {
                                        string orConditions = "";
                                        string orAppend = "";

                                        foreach (string colNm in filter.ColNms)
                                        {
                                            string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + colNm + (filter.MatchCase == false ? ")" : "");
                                            orConditions += orAppend + colNmQuery + compareCond + colValue;
                                            orAppend = " OR ";
                                        }

                                        sql += strToAppend + "(" + orConditions + ")";
                                        strToAppend = " AND ";
                                    }
                                    else
                                    {
                                        // Single column condition
                                        string colNmQuery = (filter.MatchCase == false ? "LOWER(" : "") + filter.ColNm + (filter.MatchCase == false ? ")" : "");
                                        sql += strToAppend + colNmQuery + compareCond + colValue;
                                        strToAppend = " AND ";
                                    }
                                }
                            }
                            if (filter.MatchType == "10") // IS NULL
                            {
                                if (filter.ColNms != null && filter.ColNms.Count > 0)  //Multiple column condition
                                {
                                    string orConditions = "";
                                    string orAppend = "";

                                    foreach (string colNm in filter.ColNms)
                                    {
                                        orConditions += orAppend + colNm + " IS NULL";
                                        orAppend = " OR ";
                                    }

                                    sql += strToAppend + "(" + orConditions + ")";
                                    strToAppend = " AND ";
                                }
                                else
                                {
                                    // Single column condition
                                    sql += strToAppend + filter.ColNm + " IS NULL";
                                    strToAppend = " AND ";
                                }
                            }
                            else if (filter.MatchType == "11")
                            {
                                if (filter.ColNms != null && filter.ColNms.Count > 0)  //Multiple column condition
                                {
                                    string orConditions = "";
                                    string orAppend = "";

                                    foreach (string colNm in filter.ColNms)
                                    {
                                        orConditions += orAppend + colNm + " IS NOT NULL";
                                        orAppend = " OR ";
                                    }

                                    sql += strToAppend + "(" + orConditions + ")";
                                    strToAppend = " AND ";
                                }
                                else
                                {
                                    // Single column condition
                                    sql += strToAppend + filter.ColNm + " IS NOT NULL";
                                    strToAppend = " AND ";
                                }
                            }
                        }
                        else if (filter.ColType == "2") // IN clause filter
                        {
                            if (!string.IsNullOrEmpty(filter.ColValFrom))
                            {
                                sql += strToAppend + filter.ColNm + " IN (" + filter.ColValFrom + ")";
                                strToAppend = " AND ";
                            }
                        }
                    }
                }
            }

            //get totalDataCount
            string DataCntSql = "SELECT COUNT(*) ";
            // Execute count query by combining count SQL with the filtered query (without ORDER BY) to get the total data count
            int DataCnt = searchDataBaseParam.DataConnection.Query<int>(DataCntSql + " " + sql).FirstOrDefault();

            //add order by part
            string sortTableOrderBy = "";

            if (string.IsNullOrEmpty(sortTableOrderBy))
            {
                sql += " " + DataOrderBy;  // Use original ORDER BY from input query
            }
            else
            {
                sql += " " + sortTableOrderBy;  // Use custom user sorting
            }

            // Apply pagination if parameters are provided
            if (searchDataBaseParam.Offset.HasValue && searchDataBaseParam.Rows.HasValue)
            {
                sql += " " + "OFFSET " + searchDataBaseParam.Offset + " ROWS FETCH NEXT " + searchDataBaseParam.Rows + " ROWS ONLY ";
            }
            else if (searchDataBaseParam.Offset.HasValue)
            {
                // Only offset specified - get all rows after offset
                sql += " " + "OFFSET " + searchDataBaseParam.Offset + " ROWS";
            }

            // Execute the final query to fetch the actual data with all filters, sorting and pagination applied
            var data = searchDataBaseParam.DataConnection.Query<T>(DataSelectQuery + " " + sql).ToList();

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
    }
}