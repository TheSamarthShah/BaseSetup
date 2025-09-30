using System.Linq.Expressions;

namespace BaseSetup.Model.Core
{
	/// <summary>
	/// Represents a filter condition for column-based data searching.
	/// </summary>
	public class GetDataColumnFilterModel
	{
		public string? ColNm { get; set; }
		public List<string> ColNms { get; set; } = new();

		public ColumnDataType? ColDataType { get; set; }
		public ColumnInputType? ColInputType { get; set; }

		public string? ColValFrom { get; set; }
		public string? ColValTo { get; set; }

		public FilterMatchType? MatchType { get; set; }

		public bool MatchCase { get; set; } = false;
	}

	public class DataColumnFilterOverrides<TSource>
	{
		public Expression<Func<TSource, object>> Property { get; set; } = default!;
		public string? ColNm { get; set; }
		public List<string>? ColNms { get; set; }

		public ColumnDataType? ColDataType { get; set; }
		public ColumnInputType? ColInputType { get; set; }
		public bool MatchCase { get; set; }
	}

	public enum ColumnDataType
	{
		String = 1,
		Int = 2,
		Long = 3,
		BigInt = 4,
		Decimal = 5,
		Date = 6
	}

	public enum ColumnInputType
	{
		TextBox = 1,
		Checkbox = 2,
		Radio = 3
	}

	public enum FilterMatchType
	{
		Like = 1,  // 〜
		Equals = 2,  // と等しい
		NotEquals = 3,  // と等しくない
		StartsWith = 4,  // で始まる
		NotStartsWith = 5,  // で始まらない
		EndsWith = 6,  // で終わる
		NotEndsWith = 7,  // で終わらない
		Contains = 8,  // を含む
		NotContains = 9,  // を含まない
		IsBlank = 10, // が空白
		IsNotBlank = 11  // が空白でない
	}
}
