using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Erudite.Data.Models;

namespace Erudite.Data
{
    public class EruditeDbContext : IdentityDbContext
    {
      public EruditeDbContext() {}

      public EruditeDbContext(DbContextOptions options) : base(options) {

      }
        
      public virtual DbSet<DictionaryWord> GameDictionary { get; set; }   
    }
}