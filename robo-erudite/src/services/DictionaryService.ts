import { IDictionaryWord } from "@/data/IDictionaryWord";
import { DictionaryWord } from "@/data/DictionaryWord";
import { IDictionaryService } from "./IDictionaryService";
import axios from "axios"
import { WordDefinition } from "@/data/WordDefinition";
// const axios = require('axios').default;
export class DictionaryService implements IDictionaryService {
  baseUrl="";

  constructor(baseUrl?: string){
    if(baseUrl)
      this.baseUrl=baseUrl;
  }

  async LoadGameDictionary(): Promise<IDictionaryWord[]> {
    const gameDictionary: DictionaryWord[] = [];
    await axios.get("/api/gamewords")
    .then( (resp) => {
      if(resp.status === 200){
        const dict=resp.data.data as string[];
        dict.forEach( (s)=> { 
          const dw=new DictionaryWord();
          dw.word=s;
          gameDictionary.push(dw); 
        });
      }
    });  
    return gameDictionary;
  }

  async GetWordDefinition(word: string): Promise<WordDefinition> {
    const prm=new Promise<WordDefinition>( async (resolve, reject) =>
    {
      const rqDefn=`/api/getdfn/${word}`;
      const rqResp= await axios.get(rqDefn);
      if(rqResp.status === 200){
        const defn=rqResp.data.definition as string;
        const wordDefinition=new WordDefinition(word, defn);
        resolve(wordDefinition);
      }
      else {
        reject(new Error("Request for definition failed")
        .message=`status ${rqResp.status} - ${rqResp.statusText}`);
      }
    });   
    return prm;
  }
  
}