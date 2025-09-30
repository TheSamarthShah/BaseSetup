using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
    [Table("sc_main.S_SET005")]
    public class S_SET005Model : BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Userid { get; set; } = new();
        [Key]
        public PropertyWrapper<string?> Formid { get; set; } = new();
        [Key]
        public PropertyWrapper<int?> Colno { get; set; } = new();
        public PropertyWrapper<int?> Dispcolno { get; set; } = new();
        public PropertyWrapper<int?> Visible { get; set; } = new();
        public PropertyWrapper<int?> Frozen { get; set; } = new();
        public PropertyWrapper<string?> Colnm { get; set; } = new();
    }
}
