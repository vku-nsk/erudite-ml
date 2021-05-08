using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Erudite.Services;
using Erudite.Web.ViewModels;

namespace Erudite.Controllers
{
  [ApiController]
  public class DictionaryController : ControllerBase
  {
    private readonly ILogger<DictionaryController> _logger;
    private readonly IDictionaryService _dictionaryService;

    public DictionaryController(ILogger<DictionaryController> logger, IDictionaryService dictionaryService){
      _logger=logger;
      _dictionaryService=dictionaryService;
    }    

    [HttpGet("/api/gamewords")]
    public ActionResult GetGameWords() {
      var gameWords=_dictionaryService.GetGameWords();
      return Ok(gameWords);
    }

    [HttpGet("/api/getdfn/{word}")]
    public ActionResult GetWordDefinition(string word){
      var wordDfn=_dictionaryService.GetWordDefinition(word);
      return Ok(new WordDefinition() { Word=word, Definition=wordDfn.Data } ); 
    }
  }
}