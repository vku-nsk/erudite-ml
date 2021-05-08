import { IDictionaryWord } from "../data/IDictionaryWord";
import { WordDefinition } from "../data/WordDefinition"

export interface IDictionaryService
{
  LoadGameDictionary() : Promise<IDictionaryWord[]>;
  GetWordDefinition(word: String) : Promise<WordDefinition>; 
}