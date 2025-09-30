using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
    [Table("sc_main.S_SET006")]
    public class S_SET006Model : BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Userid { get; set; } = new();
        [Key]
        public PropertyWrapper<string?> Formid { get; set; } = new();
        public PropertyWrapper<string?> Last_conditionno { get; set; } = new();              
    }
}
