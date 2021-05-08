using System;
using System.Collections.Generic;
using System.Linq;
using Erudite.Data;
using Microsoft.EntityFrameworkCore;

namespace Erudite.Services
{
  public class DictionaryService : IDictionaryService
  {
    private readonly EruditeDbContext _db;

    public DictionaryService(EruditeDbContext dbContext){
      _db=dbContext;
    }
    public ServiceResponce<string[]> GetGameWords()
    {
      ServiceResponce<string[]> serviceResponce=new ServiceResponce<string[]>();
      try{
        serviceResponce.Data=_db.GameDictionary.OrderByDescending(w=>w.Freq).Select(w => w.Word).AsNoTracking().ToArray();
        serviceResponce.IsSuccess=true;
      }
      catch (Exception e)
      {
        serviceResponce.Message=e.Message;
        serviceResponce.IsSuccess=true;
      }
      return serviceResponce;
    }

    public ServiceResponce<string> GetWordDefinition(string word)
    {
      ServiceResponce<string> serviceResponce=new ServiceResponce<string>();
      try{
        serviceResponce.Data=_db.GameDictionary.AsNoTracking()
          .Where(w=>w.Word.Equals(word)).FirstOrDefault()?.Definition;
        if(serviceResponce.Data != null && serviceResponce.Data.Length != 0)
          serviceResponce.IsSuccess=true;
        else{
          serviceResponce.Message="definition is empty";
          serviceResponce.IsSuccess=false;
        }  
      }
      catch (Exception e)
      {
        serviceResponce.Message=e.Message;
        serviceResponce.IsSuccess=true;
      }
      return serviceResponce;
    }
  }
}