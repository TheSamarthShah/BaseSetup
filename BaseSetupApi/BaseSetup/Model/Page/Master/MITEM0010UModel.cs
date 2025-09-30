using BaseSetup.Common.Attributes;
using BaseSetup.Model.Common;
using BaseSetup.Model.Core;

namespace BaseSetup.Model.Page.Master
{
	public class MITEM0010UModel : BaseModel
	{
		//Total number of data retrieved
		public int? TotalData { get; set; }
		//List of retrieved data
		public List<Record> Records { get; set; }

		public class Search : RequestModel
		{

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Itemcd { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Productcd { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Productnm { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Productno { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Hmnm { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Hmrnm { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Webitemcd { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.Long)]
			public SearchOption? Jancd { get; set; }

			[ColInputType(ColumnInputType.Checkbox), ColDataType(ColumnDataType.String)]
			public string? Itemtyp { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.Date)]
			public SearchOption? Valstartymd { get; set; }

            [ColInputType(ColumnInputType.Radio), ColDataType(ColumnDataType.String)]
            public string? isactive { get; set; }

            [ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Refitemcd { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Orgitemcd { get; set; }

			[ColInputType(ColumnInputType.TextBox), ColDataType(ColumnDataType.String)]
			public SearchOption? Priceitemcd { get; set; }
		}

		public class Record
		{
			public string? Itemcd { get; set; }
			public string? Productcd { get; set; }
			public string? Productnm { get; set; }
			public string? Productno { get; set; }
			public string? Hmnm { get; set; }
			public string? Hmrnm { get; set; }
			public string? Webitemcd { get; set; }
			public long? Jancd { get; set; }
			public string? Itemtyp { get; set; }
			public DateTimeOffset? Valstartymd { get; set; }
			public string? Refitemcd { get; set; }
			public string? Orgitemcd { get; set; }
			public string? Priceitemcd { get; set; }
			public DateTimeOffset? Updtdt { get; set; }
            public string? isactive { get; set; }
        }
	}
}
