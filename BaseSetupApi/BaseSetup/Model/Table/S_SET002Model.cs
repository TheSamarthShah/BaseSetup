using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
    [Table("sc_main.S_SET002")]
    public class S_SET002Model : BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Conditionno { get; set; } = new();
        [Key]
        public PropertyWrapper<string?> Columnname { get; set; } = new();
        public PropertyWrapper<int?> Seq { get; set; } = new();
        public PropertyWrapper<string?> Visible { get; set; } = new();
        public PropertyWrapper<string?> Fromvalue { get; set; } = new();
        public PropertyWrapper<string?> Tovalue { get; set; } = new();
        public PropertyWrapper<string?> Combovalue { get; set; } = new();
        public PropertyWrapper<string?> Checkvalue { get; set; } = new();

    }
}
