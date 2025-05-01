namespace BaseSetup.Repository.Core
{
    public interface ISearchDataRepository<T>
    {
        /// <summary>
        /// To search the data based on the provided search parameters.
        /// </summary>
        /// <param name="searchDataBaseParam1"></param>
        /// <returns></returns>
        SearchResponse<T> SearchDataBase(SearchDataBaseParam searchDataBaseParam1);
    }
}
