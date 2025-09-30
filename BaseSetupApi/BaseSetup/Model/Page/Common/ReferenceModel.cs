using BaseSetup.Model.Core;

namespace BaseSetup.Model.Page.Common
{
    public class ReferenceModel
    {
        public class Search
        {
            //name represents the column english name
            public string Name { get; set; }
            //displayName represents the column japanese name for display
            public string Displayname { get; set; }
            public string Valuefrom { get; set; }
            public string Valueto { get; set; }
            public FilterMatchType Matchtype { get; set; }
            public ColumnDataType Datatype { get; set; }
            public ColumnInputType Inputtype { get; set; }
        }

        public class GridColumn
        {
            //name represents the column english name
            public string? Name { get; set; }
            public ColumnDataType? Datatype { get; set; }
            //order by seq for the display the reference grid
            public int? queryOrderBySeq { get; set; }
        }

        public class S_SET008
        {
            public string USERID { get; set; }
            public string FORMID { get; set; }
            public string TABLENAME { get; set; }
            public string? INITIALSEARCHKBN { get; set; }
        }
    }
}
