namespace BaseSetup.Model.Core
{
    public class ReferenceModel
    {
        public class Search
        {
            //name represents the column english name
            public string name { get; set; }
            //displayName represents the column japanese name for display
            public string displayName { get; set; }
            public string value_from { get; set; }
            public string value_to { get; set; }
            public string match_type { get; set; }
            public string data_type { get; set; }
        }

        public class GridColumn
        {
            //name represents the column english name
            public string? name { get; set; }
            //displayName represents the column japanese name for display
            public string? displayName { get; set; }
            public string? dataType { get; set; }
            public bool? visible { get; set; }
            //column is visible in serach or not
            public bool? searchVisible { get; set; }
            //order by seq for the display the reference grid
            public int? orderBySeq { get; set; }
        }
    }
}
