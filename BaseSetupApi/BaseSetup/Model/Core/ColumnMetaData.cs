namespace BaseSetup.Model.Core
{
    public class ColumnMetaData
    {
        public string ColumnName { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public int? CharColDeclLength { get; set; }
        public int? DataPrecision { get; set; }
        public int? DataScale { get; set; }
    }

}
