namespace BaseSetup.Repository.Core
{
    public interface ISaveDataRepository<TGrid>
    {
        /// <summary>
        /// Common data-saving method that generates dynamic insert, update, and delete queries based on the provided list
        /// </summary>
        /// <param name="saveDataParams"></param>
        /// <returns></returns>
        string SaveDataBase(SaveDataParams<TGrid> saveDataParams);
    }
}
