using BaseSetup.Model.Core;

namespace BaseSetup.Common.Attributes
{
	[AttributeUsage(AttributeTargets.Property)]
	public class ColDataTypeAttribute(ColumnDataType dataType) : Attribute
	{
		public ColumnDataType DataType { get; } = dataType;
	}
}
