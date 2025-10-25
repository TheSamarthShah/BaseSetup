using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
	[Table("M_ITEM0010_TEST")]
	public class M_ITEM0010_TESTModel : BaseModel
	{
		[Key]
		public PropertyWrapper<string?> Itemcd { get; set; } = new();
		public PropertyWrapper<string?> Productcd { get; set; } = new();
		public PropertyWrapper<string?> Productno { get; set; } = new();
		public PropertyWrapper<string?> Webitemcd { get; set; } = new();
		public PropertyWrapper<long?> Jancd { get; set; } = new();
		public PropertyWrapper<string?> Itemtyp { get; set; } = new();
		public PropertyWrapper<string?> Refitemcd { get; set; } = new();
		public PropertyWrapper<string?> Orgitemcd { get; set; } = new();
		public PropertyWrapper<string?> Priceitemcd { get; set; } = new();
		public PropertyWrapper<DateTimeOffset?> Valstartymd { get; set; } = new();
		public PropertyWrapper<string?> Hmnm { get; set; } = new();
		public PropertyWrapper<string?> Hmrnm { get; set; } = new();
		public PropertyWrapper<DateTimeOffset?> Updtdt { get; set; } = new();
        public PropertyWrapper<string?> isactive { get; set; } = new();
    }
}
