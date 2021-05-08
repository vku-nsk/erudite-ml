using System.Collections.Generic;

namespace Erudite.Services
{
    public interface IDictionaryService
    {
      ServiceResponce<string[]> GetGameWords();   

      ServiceResponce<string> GetWordDefinition(string word);   

    }
}