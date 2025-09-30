using BaseSetup.Model.Common;

namespace BaseSetup.Model.Page.Common
{
    public class SortingDataModel
    {
        public string? Userid { get; set; }
        public string? Formid { get; set; }
        public List<SortColumnDetail> Columns { get; set; }

        public class S_SET004
        {
            public string UserId { get; set; }
            public string FormId { get; set; }

            public string? SortColumn1 { get; set; }
            public string? SortColumn2 { get; set; }
            public string? SortColumn3 { get; set; }
            public string? SortColumn4 { get; set; }
            public string? SortColumn5 { get; set; }

            public char? Asc1 { get; set; }
            public char? Asc2 { get; set; }
            public char? Asc3 { get; set; }
            public char? Asc4 { get; set; }
            public char? Asc5 { get; set; }
        }

        public class SortColumnDetail
        {
            public string? SortSeq { get; set; }
            public string? SortColumn { get; set; }
            public string? SortType { get; set; }
        }
    }
}
