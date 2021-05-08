import { DictionaryWord } from "../data/DictionaryWord";
// tsconfig.json добавлен флаг "resolveJsonModule": true
// Основа словаря - частотный словарь (Ляшевская, Шаров)
// словарь создан отбором существительнх длиной от 2 до 15 букв
// с обратной сортировкой по частоте использования
// import dictionary from "../assets/dictionary.json";
import { WordSite } from "./WordSite";
// import { IDictionaryWord } from "../data/IDictionaryWord";
import { IDictionaryService } from "../services/IDictionaryService"
import { DictionaryService } from "../services/DictionaryService"
import { WordDefinition } from "@/data/WordDefinition";

export class Dictionary {
  byWordLength: string[][] = [];
  dictService?: IDictionaryService;
  loaded=false;

  constructor() {
    this.dictService=new DictionaryService();
  }

  async load() {
    const dictWords=await this.dictService?.LoadGameDictionary();
    if(dictWords){
      let wordsCount=0;
      // const dictWords = resp as IDictionaryWord[];
      for (let wLen = 2; wLen <= 15; wLen++) {
        const arr = dictWords.filter(dw => {
          return dw.word.length === wLen;
        }).map(el => {
          return el.word;
        });
        this.byWordLength.push(arr);
        wordsCount+=arr.length;
      }
      console.log(`загружен словарь ${wordsCount} слов`);
      this.loaded=true;
    }
  }

  async getWordDefinition(word: string) : Promise<WordDefinition> {
    if(this.dictService)
      return await this.dictService.GetWordDefinition(word);
    else
      throw new Error("Сервис толкового словаря недоступен.");  
  } 

  generateStartWord(wLen: number): string | undefined {
    const words = this.getWordsOfLength(wLen);
    const iw = Math.floor(Math.random() * words.length);
    if (iw !== 0) return words[iw];
    return undefined;
  }

  // возвращает заготовленный при инициализации массив
  public getWordsOfLength(wLen: number): string[] {
    return this.byWordLength[wLen - 2];
  }

  // слово игрового поля присутствует в словаре
  gameWordExists(word: WordSite): boolean {
    return this.wordExists(word.str);
  }

  // слово присутствует в словаре; слово должно быть в нижнем регистре
  wordExists(wordStr: string): boolean {
    const wLen=wordStr.length;
    if(wLen < 2 || wLen > 15)
      return false;
    return this.getWordsOfLength(wLen).findIndex( w => w == wordStr) !== -1;  
  }
}
