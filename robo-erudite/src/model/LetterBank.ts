import { Letter } from "./Letter";

export class LetterBank {
  static letterCost : {[key: string]: number} = 
  {
    "а" : 1,
    "б": 4,
    "в": 3,
    "г": 4,
    "д": 3,
    "е": 1,
    "ж": 5,
    "з": 4,
    "и": 1,
    "й": 6,
    "к": 2,
    "л": 2,
    "м": 3,
    "н": 1,
    "о": 1,
    "п": 3,
    "р": 1,
    "с": 2,
    "т": 1,
    "у": 3,
    "ф": 6,
    "х": 6,
    "ц": 5,
    "ч": 5,
    "ш": 5,
    "щ": 7,
    "ь": 4,
    "ы": 6,
    "ъ": 12,
    "э": 8,
    "ю": 7,
    "я": 4
    };
  
  bank: Letter[];

  constructor() {
    this.bank = this.generateByEstimatedFrequency();
  }

  get numLetters()
  {
    return this.bank.length;
  }

  static wordCost(word: string): number {
    let cost=0;
    for (let i = 0; i < word.length; i++) {
      cost += LetterBank.letterCost[word[i]];
    }
    word
    return cost;
  }

  // взять из банка буквы для слова; НЕОПР если в банке нет к-либо буквы
  getLettersForWord(word: string, removeFromBank = true): Letter[] | undefined {
    const wordLetters: Letter[] = [];

    for (let i = 0; i < word.length; i++) {
      const inBank = this.bank.filter(lt => {
        return lt.character[0] == word[i];
      });
      
      if (inBank.length == 0) {
        // если не удалось взять букву (в слове дубль единственной в банке), вернуть взятые
        this.putBack(...wordLetters);
        return undefined;
      }
      const bankIndex = this.bank.indexOf(inBank[0]);
      if (removeFromBank) {
        wordLetters.push(inBank[0]);
        this.bank.splice(bankIndex, 1);
      } else {
        const lt = new Letter(inBank[0].character, inBank[0].points);
        wordLetters.push(lt);
      }
    }
    return wordLetters;
  }

  // взять из банка несколько букв
  getRandom(count: number): Letter[] {
    const letters: Letter[] = [];
    for (let i = 0; i < count && i < this.bank.length; i++) {
      const bankIndex = Math.floor(Math.random() * this.bank.length);
      const lt=this.bank[bankIndex];
      if(!lt || lt.character==="")
        throw new Error("НЕОПР из банка");
      letters.push(lt);
      this.bank.splice(bankIndex, 1);
    }
    return letters;
  }

  putBack(...letters: Letter[]) {
    letters.forEach(l => l.clean());
    this.bank.push(...letters);
  }

  private generateLetters(
    letter: string,
    count: number
  ): Letter[] {
    const letters: Letter[] = [];
    for (let i = 0; i < count; i++) {
      letters.push(new Letter(letter, LetterBank.letterCost[letter]));
    }
    return letters;
  }

  private generateByEstimatedFrequency(): Letter[] {
    // буква, число в банке
    const la = this.generateLetters("а", 12);
    la.push(...this.generateLetters("б", 3));
    la.push(...this.generateLetters("в", 4));
    la.push(...this.generateLetters("г", 3));
    la.push(...this.generateLetters("д", 4));
    la.push(...this.generateLetters("е", 11));
    la.push(...this.generateLetters("ж", 2));
    la.push(...this.generateLetters("з", 3));
    la.push(...this.generateLetters("и", 10));
    la.push(...this.generateLetters("й", 1));
    la.push(...this.generateLetters("к", 7));
    la.push(...this.generateLetters("л", 6));
    la.push(...this.generateLetters("м", 3));
    la.push(...this.generateLetters("н", 8));
    la.push(...this.generateLetters("о", 12));
    la.push(...this.generateLetters("п", 5));
    la.push(...this.generateLetters("р", 8));
    la.push(...this.generateLetters("с", 7));
    la.push(...this.generateLetters("т", 8));
    la.push(...this.generateLetters("у", 3));
    la.push(...this.generateLetters("ф", 1));
    la.push(...this.generateLetters("х", 1));
    la.push(...this.generateLetters("ц", 2));
    la.push(...this.generateLetters("ч", 2));
    la.push(...this.generateLetters("ш", 1));
    la.push(...this.generateLetters("щ", 1));
    la.push(...this.generateLetters("ь", 3));
    la.push(...this.generateLetters("ы", 1));
    la.push(...this.generateLetters("ъ", 1));
    la.push(...this.generateLetters("э", 1));
    la.push(...this.generateLetters("ю", 1));
    la.push(...this.generateLetters("я", 2));

    return la;
  }
}
