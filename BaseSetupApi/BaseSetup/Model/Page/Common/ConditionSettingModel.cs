using BaseSetup.Common.Attributes;
using BaseSetup.Model.Common;
using BaseSetup.Model.Core;

namespace BaseSetup.Model.Page.Common
{
    public class ConditionSettingModel : BaseModel
	{
        public class Search : RequestModel
        {
			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Conditionno { get; set; }
			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Conditionnm { get; set; }
			//1: private, 2:public
			[ColInputType(ColumnInputType.Checkbox), ColDataType(ColumnDataType.String)]
			public string? Accesskbn { get; set; }
			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Usernm { get; set; }
        }

        public class Save
        {
            public string? Conditionno { get; set; }
            public string? Conditionnm { get; set; }
            public string? Formid { get; set; }
            public string? Userid { get; set; }
            public string? Accesskbn { get; set; }
            public List<S_SET002>? ColumnsData { get; set; }
        }

        public class S_SET002
        {
            public string? Columnname { get; set; }
            public int? Seq { get; set; }
            public string? Visible { get; set; }
            public string? Fromvalue { get; set; }
            public string? ToValue { get; set; }
            public string? Combovalue { get; set; }
            public string? Checkvalue { get; set; }

            //1: string, 2: number, 3: date
            public string? Datatype { get; set; }
        }

        public class S_SET006
        {
            public string Userid { get; set; }
            public string Formid { get; set; }
            public string? Conditionno { get; set; }
        }
    }
}
