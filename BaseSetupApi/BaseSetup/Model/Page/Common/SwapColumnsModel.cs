using BaseSetup.Model.Common;

namespace BaseSetup.Model.Page.Common
{
    public class SwapColumnsModel: RequestModel
    {
        //Column actual seq
        public int Colno { get; set; }
        //Column english name
        public string Colnm { get; set; }
        //display grid column seq
        public int Dispcolno { get; set; }
        public int Visible { get; set; }
        public int Frozen { get; set; }
    }
}