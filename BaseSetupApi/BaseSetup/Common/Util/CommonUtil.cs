using BaseSetup.Common.Attributes;
using BaseSetup.Model.Core;
using static BaseSetup.Model.Common.BaseModel;
using System.Linq.Expressions;
using System.Reflection;

namespace BaseSetup.Common.Util
{
	public static class CommonUtil
	{
		/// <summary>
		/// Convert the SaveObj of type TSource to TTarget
		/// </summary>
		/// <typeparam name="TSource"></typeparam>
		/// <typeparam name="TTarget"></typeparam>
		/// <param name="sourceSaveObj"></param>
		/// <param name="mappings">List of tuple of source and target's column names</param>
		/// <returns></returns>
		public static SaveObj<TTarget> MapSaveObj<TSource, TTarget>(
			SaveObj<TSource> sourceSaveObj,
			List<PropertyMap<TSource, TTarget>> mappings
		)
			where TTarget : new()
		{
			SaveObj<TTarget> targetSaveObj = new()
			{
				Formid = sourceSaveObj.Formid,
				Userid = sourceSaveObj.Userid,
				Programnm = sourceSaveObj.Programnm,
			};

			// Handle AddList
			if (sourceSaveObj.AddList != null)
				targetSaveObj.AddList = sourceSaveObj.AddList
					.Select(item => MapSingle<TSource, TTarget>(item, mappings))
					.ToList();

			// Handle UpdateList
			if (sourceSaveObj.UpdateList != null)
				targetSaveObj.UpdateList = sourceSaveObj.UpdateList
					.Select(item => MapSingle<TSource, TTarget>(item, mappings))
					.ToList();

			// Handle DeleteList
			if (sourceSaveObj.DeleteList != null)
				targetSaveObj.DeleteList = sourceSaveObj.DeleteList
					.Select(item => MapSingle<TSource, TTarget>(item, mappings))
					.ToList();

			return targetSaveObj;
		}

		/// <summary>
		/// Method to assign the values from source to target.
		/// Considers the case of property wrapper too.
		/// </summary>
		/// <typeparam name="TSource"></typeparam>
		/// <typeparam name="TTarget"></typeparam>
		/// <param name="source"></param>
		/// <param name="mappings"></param>
		/// <returns></returns>
		public static TTarget MapSingle<TSource, TTarget>(
			TSource source,
			List<PropertyMap<TSource, TTarget>> mappings
		) where TTarget : new()
		{
			var target = new TTarget();
			var sourceType = typeof(TSource);
			var targetType = typeof(TTarget);

			foreach (var map in mappings)
			{
				var sourceProp = sourceType.GetProperty(map.GetSourceName());
				var targetProp = targetType.GetProperty(map.GetTargetName());

				if (sourceProp == null || targetProp == null)
					continue;

				var rawSourceValue = sourceProp.GetValue(source);
				var sourceValue = GetPropertyValue(rawSourceValue);
				// If property wrapper then create its instance and assign to "Value" property.
				if (targetProp.PropertyType.IsGenericType &&
					targetProp.PropertyType.GetGenericTypeDefinition() == typeof(PropertyWrapper<>))
				{
					var wrapperInstance = Activator.CreateInstance(targetProp.PropertyType);
					var valueProp = targetProp.PropertyType.GetProperty("Value");

					valueProp?.SetValue(wrapperInstance, sourceValue);

					targetProp.SetValue(target, wrapperInstance);
				}
				else
				{
					targetProp.SetValue(target, sourceValue);
				}
			}

			return target;
		}

		/// <summary>
		/// Gives list of all properties form the recors which are manually set.
		/// Made for property wrapper models.
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="record"></param>
		/// <returns></returns>
		public static List<string> GetSetProperties<T>(T record)
		{
			if (record == null) return new List<string>();

			var setProperties = new List<string>();

			var props = typeof(T).GetProperties();
			foreach (var prop in props)
			{
				var value = prop.GetValue(record);
				if (value == null) continue;

				var isSetProp = value.GetType().GetProperty("IsSet");
				if (isSetProp != null)
				{
					var isSet = isSetProp.GetValue(value);
					if (isSet is bool b && b)
					{
						setProperties.Add(prop.Name);
					}
				}
			}

			return setProperties;
		}

		/// <summary>
		/// Method to identify if the property is PropertyWrapper or not.
		/// Helps to idenfify for to select and set the value.
		/// </summary>
		/// <param name="type"></param>
		/// <returns></returns>
		private static bool IsPropertyWrapper(Type type)
		{
			if (!type.IsGenericType)
				return false;

			return type.GetGenericTypeDefinition() == typeof(PropertyWrapper<>);
		}

		/// <summary>
		/// Gives the value of property weather normal or wrapped with PropertyWrapper
		/// </summary>
		/// <param name="instance"></param>
		/// <returns></returns>
		public static object? GetPropertyValue(object? instance)
		{
			if (instance == null) return null;

			var type = instance.GetType();
			if (IsPropertyWrapper(type))
			{
				return type.GetProperty("Value")?.GetValue(instance);
			}

			return instance;
		}

		/// <summary>
		/// Makes new object of type T with same values as source object
		/// </summary>
		/// <typeparam name="T"></typeparam>
		/// <param name="source"></param>
		/// <returns></returns>
		public static T Clone<T>(T source) where T : new()
		{
			var clone = new T();
			foreach (var prop in typeof(T).GetProperties().Where(p => p.CanRead && p.CanWrite))
			{
				var value = prop.GetValue(source);
				prop.SetValue(clone, value);
			}
			return clone;
		}

		private static string GetPropertyNameFromExpression<TSource>(Expression<Func<TSource, object>> expr)
		{
			if (expr.Body is UnaryExpression unary && unary.Operand is MemberExpression member1)
				return member1.Member.Name;

			if (expr.Body is MemberExpression member2)
				return member2.Member.Name;

			throw new ArgumentException("Invalid expression");
		}

		public static List<GetDataColumnFilterModel> GetDataFilters<TSearch>(
			TSearch searchData,
			List<DataColumnFilterOverrides<TSearch>>? overrides = null
		)
		{
			List<GetDataColumnFilterModel> filters = new List<GetDataColumnFilterModel>();
			PropertyInfo[] props = typeof(TSearch).GetProperties();

			// Properties we want to skip (control fields, not filters)
			HashSet<string> skipProps = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
			{
				"Offset", "Rows", "UserId", "FormId"
			};

			// Pre-map override property names
			Dictionary<string, DataColumnFilterOverrides<TSearch>>? overrideDict =
				overrides?.ToDictionary(
					(DataColumnFilterOverrides<TSearch> ov) => GetPropertyNameFromExpression(ov.Property),
					(DataColumnFilterOverrides<TSearch> ov) => ov,
					StringComparer.OrdinalIgnoreCase
				);

			foreach (PropertyInfo prop in props)
			{
				if (skipProps.Contains(prop.Name))
					continue;

				object? value = prop.GetValue(searchData);
				if (value == null) continue;

				// Grab attribute metadata
				ColumnDataType colDataType =
					prop.GetCustomAttribute<ColDataTypeAttribute>()?.DataType ?? ColumnDataType.String;
				ColumnInputType colType =
					prop.GetCustomAttribute<ColInputTypeAttribute>()?.InputType ?? ColumnInputType.TextBox;

				// Handle SearchOption vs direct value
				string? valFrom = null;
				string? valTo = null;
				FilterMatchType? matchType = null;

				PropertyInfo? fromProp = prop.PropertyType.GetProperty("From");
				PropertyInfo? toProp = prop.PropertyType.GetProperty("To");
				PropertyInfo? typeProp = prop.PropertyType.GetProperty("Type");

				if (fromProp != null || toProp != null || typeProp != null)
				{
					valFrom = fromProp?.GetValue(value)?.ToString();
					valTo = toProp?.GetValue(value)?.ToString();

					if (typeProp != null)
					{
						object? rawValue = typeProp.GetValue(value);
						if (rawValue != null)
						{
							if (rawValue is FilterMatchType enumVal)
								matchType = enumVal;
							else
								matchType = (FilterMatchType)Convert.ToInt32(rawValue);
						}
					}
				}
				else
				{
					valFrom = value.ToString();
				}

				GetDataColumnFilterModel filter = new GetDataColumnFilterModel
				{
					ColNm = prop.Name.ToUpper(),
					ColDataType = colDataType,
					ColInputType = colType,
					ColValFrom = valFrom,
					ColValTo = valTo,
					MatchType = matchType
				};

				// Apply overrides if available
				if (overrideDict != null && overrideDict.TryGetValue(prop.Name, out DataColumnFilterOverrides<TSearch>? ov))
				{
					if (ov.ColNm != null) filter.ColNm = ov.ColNm;
					if (ov.ColNms != null) filter.ColNms = ov.ColNms;
					if (ov.ColDataType != null) filter.ColDataType = ov.ColDataType;
					if (ov.ColInputType != null) filter.ColInputType = ov.ColInputType;
					filter.MatchCase = ov.MatchCase;
				}

				filters.Add(filter);
			}

			return filters;
		}
	}
}
