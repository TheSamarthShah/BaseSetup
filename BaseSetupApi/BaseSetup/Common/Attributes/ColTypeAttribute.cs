using BaseSetup.Model.Core;

namespace BaseSetup.Common.Attributes
{
	[AttributeUsage(AttributeTargets.Property)]
	public class ColInputTypeAttribute(ColumnInputType colType) : Attribute
	{
		public ColumnInputType InputType { get; } = colType;
	}
}
