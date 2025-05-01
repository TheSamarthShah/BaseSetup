namespace BaseSetup.Model.Core
{
    /// <summary>
    /// Represents a filter condition for column-based data searching.
    /// </summary>
    public class GetData_ColumnFilter
    {
        //colnm should also have tablename with it
        public string? ColNm { get; set; }

        // List of column names for multi-column filters.
        public List<string> ColNms { get; set; }

        //1: string, 2: int, 3: long, 4:bigint, 5: decimal, 6: date
        public string? ColDataType { get; set; }

        // 1: TextBox, 2: Checkbox
        public string? ColType { get; set; }

        public string? ColValFrom { get; set; }

        public string? ColValTo { get; set; }

        // Types for each property (used for LIKE and exact match conditions)
        //1 :- 〜
        //2 :- と等しい(equals)
        //3 :- と等しくない(does not equal)
        //4 :- で始まる(starts with)
        //5 :- で始まらない(does not start with)
        //6 :- で終わる(ends with)
        //7 :- で終わらない(does not end with)
        //8 :- を含む(contains)
        //9 :- を含まない(does not contain)
        //10 :- が空白(is blank)
        //11 :- が空白でない(is not blank)
        public string? MatchType { get; set; }

        //whether to comapre case or not,while fetching values
        public Boolean? MatchCase { get; set; } = false;
    }
}
