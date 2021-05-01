export class Letter {
  character: string;
  points: number;
  flagged: boolean;

  constructor(char?: string, points?: number) {
    this.flagged = false;
    if (char && points) {
      this.character = char;
      this.points = points;
    } else {
      this.character = "";
      this.points = 0;
    }
  }

  get isVowel() : boolean 
  {
    if(this.character.length != 0){
      if(this.character == "а"
        || this.character == "у"   
        || this.character == "о"   
        || this.character == "ы"   
        || this.character == "и"   
        || this.character == "э"   
        || this.character == "я"   
        || this.character == "ю"   
        || this.character == "е"   
        || this.character == "ё"   
      ){
        return true;
      }
    }
    return false;
  }

  get isConsonant(): boolean
  {
    if(this.character.length != 0){
      if(this.character == "б"
        || this.character == "в"   
        || this.character == "г"   
        || this.character == "д"   
        || this.character == "ж"   
        || this.character == "з"   
        || this.character == "й"   
        || this.character == "к"   
        || this.character == "л"   
        || this.character == "м"   
        || this.character == "н"   
        || this.character == "п"   
        || this.character == "р"   
        || this.character == "с"   
        || this.character == "т"   
        || this.character == "ф"   
        || this.character == "х"   
        || this.character == "ц"   
        || this.character == "ч"   
        || this.character == "ш"   
        || this.character == "щ"   
      ){
        return true;
      }
    }
    return false;
  }

  get isMark() : boolean 
  {
    if(this.character.length != 0){
      if(this.character == "ь"
        || this.character == "ъ"   
      ){
        return true;
      }
    }
    return false;
  }

  // "как новая" (т.е. очистить флаги)
  clean() {
    this.flagged = false;
  }
}
