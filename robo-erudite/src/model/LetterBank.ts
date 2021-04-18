import { Letter } from "./Letter";

export class LetterBank {
  bank: Letter[];

  constructor() {
    this.bank = this.generateAsErudite();
  }

  get numLetters()
  {
    return this.bank.length;
  }

  // взять из банка буквы для слова; НЕОПР если в банке нет к-либо буквы
  getLettersForWord(word: string, removeFromBank = true): Letter[] | undefined {
    const wordLetters: Letter[] = [];

    for (let i = 0; i < word.length; i++) {
      const inBank = this.bank.filter(lt => {
        return lt.character[0] === word[i];
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
    points: number,
    count: number
  ): Letter[] {
    const letters: Letter[] = [];
    for (let i = 0; i < count; i++) {
      letters.push(new Letter(letter, points));
    }
    return letters;
  }

  private generateAsErudite(): Letter[] {
    const la = this.generateLetters("а", 1, 10);
    la.push(...this.generateLetters("б", 3, 3));
    la.push(...this.generateLetters("в", 2, 5));
    la.push(...this.generateLetters("г", 3, 3));
    la.push(...this.generateLetters("д", 2, 5));
    la.push(...this.generateLetters("е", 1, 9));
    la.push(...this.generateLetters("ж", 5, 2));
    la.push(...this.generateLetters("з", 5, 2));
    la.push(...this.generateLetters("и", 1, 8));
    la.push(...this.generateLetters("й", 2, 4));
    la.push(...this.generateLetters("к", 2, 6));
    la.push(...this.generateLetters("л", 2, 4));
    la.push(...this.generateLetters("м", 2, 5));
    la.push(...this.generateLetters("н", 1, 8));
    la.push(...this.generateLetters("о", 1, 10));
    la.push(...this.generateLetters("п", 2, 6));
    la.push(...this.generateLetters("р", 2, 6));
    la.push(...this.generateLetters("с", 2, 6));
    la.push(...this.generateLetters("т", 2, 5));
    la.push(...this.generateLetters("у", 3, 3));
    la.push(...this.generateLetters("ф", 10, 1));
    la.push(...this.generateLetters("х", 5, 2));
    la.push(...this.generateLetters("ц", 10, 1));
    la.push(...this.generateLetters("ч", 5, 2));
    la.push(...this.generateLetters("ш", 10, 1));
    la.push(...this.generateLetters("щ", 10, 1));
    la.push(...this.generateLetters("ъ", 10, 1));
    la.push(...this.generateLetters("ы", 5, 2));
    la.push(...this.generateLetters("ь", 5, 2));
    la.push(...this.generateLetters("э", 10, 1));
    la.push(...this.generateLetters("ю", 10, 1));
    la.push(...this.generateLetters("я", 3, 3));
    return la;
  }
}
