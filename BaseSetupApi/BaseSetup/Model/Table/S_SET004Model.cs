using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
    [Table("sc_main.S_SET004")]
    public class S_SET004Model : BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Userid { get; set; } = new();
        [Key]
        public PropertyWrapper<string?> Formid { get; set; } = new();
        public PropertyWrapper<string?> Sortcolumn1 { get; set; } = new();
        public PropertyWrapper<string?> Sortcolumn2 { get; set; } = new();
        public PropertyWrapper<string?> Sortcolumn3 { get; set; } = new();
        public PropertyWrapper<string?> Sortcolumn4 { get; set; } = new();
        public PropertyWrapper<string?> Sortcolumn5 { get; set; } = new();
        public PropertyWrapper<string?> Asc1 { get; set; } = new();
        public PropertyWrapper<string?> Asc2 { get; set; } = new();
        public PropertyWrapper<string?> Asc3 { get; set; } = new();
        public PropertyWrapper<string?> Asc4 { get; set; } = new();
        public PropertyWrapper<string?> Asc5 { get; set; } = new();

    }
}
