using System;
using System.ComponentModel.DataAnnotations;

namespace Erudite.Data.Models
{
    public class DictionaryWord
    {
      [Key]
      [MaxLength(64)]
      public string Word { get; set;}    

      public decimal Freq { get; set; }

      [MaxLength(4000)]
      public string Definition {get; set;}
    }
}