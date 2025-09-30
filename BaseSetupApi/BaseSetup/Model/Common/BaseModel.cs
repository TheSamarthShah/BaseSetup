using BaseSetup.Model.Core;
using System.Linq.Expressions;

namespace BaseSetup.Model.Common
{
    public class BaseModel
    {
        public class SearchOption
        {
            public string From { get; set; }
            public string To { get; set; }

            // Types for each property (used for LIKE and exact match conditions)
            //1 :- 〜
            //2 :- と等しい(equals)
            //3 :- と等しくない(does not equal)
            //4 :- で始まる(starts with)
            //5 :- で始まらない(does not start with)
            //6 :- で終わる(ends with)
            //7 :- で終わらない(does not end with)
            //8 :- を含む(contains)
            //9 :- を含まない(does not contain)
            //10 :- が空白(is blank)
            //11 :- が空白でない(is not blank)
            public FilterMatchType Type { get; set; } //TODO - change to MatchType
        }

        public class SaveObj<T> : RequestModel
		{
            public List<T>? AddList { get; set; }
            public List<T>? UpdateList { get; set; }
            public List<T>? DeleteList { get; set; }
        }

        //This model is for the uplode the File and download
        public class FileUploadDownloadModel
        {
            public IFormFile? File { get; set; }
            public string PhysicalPath { get; set; }
            public string? FileName { get; set; }
        }

		public class PropertyWrapper<T>
		{
			private T? _value; // Backing field for Value

			public T? Value
			{
				get => _value; // Return the backing field
				set
				{
					_value = value; // Set the backing field
					IsSet = true; // Automatically set IsSet to true when Value is assigned
				}
			}

			public bool IsSet { get; private set; } = false; // Private setter to prevent external modification
		}

		public class PropertyMap<TSource, TTarget>(Expression<Func<TSource, object>> source,
							   Expression<Func<TTarget, object>> target)
		{
			public Expression<Func<TSource, object>> Source { get; } = source;
			public Expression<Func<TTarget, object>> Target { get; } = target;

			public string GetSourceName() =>
				((MemberExpression)(Source.Body is UnaryExpression u ? u.Operand : Source.Body)).Member.Name;

			public string GetTargetName() =>
				((MemberExpression)(Target.Body is UnaryExpression u ? u.Operand : Target.Body)).Member.Name;
		}
	}
}
