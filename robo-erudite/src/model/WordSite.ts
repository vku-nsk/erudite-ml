import { LetterSite } from "./LetterSite";

export enum Direction {
  right,
  down
}

export class WordSite {
  letters: LetterSite[] = [];

  // сумма очков букв
  get points(): number {
    let pts = 0;
    this.letters.forEach(l => {
      pts += l.points;
    });
    return pts;
  }

  // слово строкой
  get str(): string {
    let str = "";
    this.letters.forEach(l => {
      str += l.character;
    });
    return str;
  }

  // в слове есть поставленная ранее буква
  get hasNotInGoLetter(): boolean {
    return this.letters.some(lt => {
      return !lt.isEmpty() && !lt.isInGo;
    });
  }

  get emptyCount(): number {
    let cn = 0;
    this.letters.forEach(lt => {
      if (lt.isEmpty()) cn++;
    });
    return cn;
  }

  // набор буквомест в словах совпадает
  isEqualTo(ws: WordSite) : boolean
  {
    if(this.length !== ws.length)
      return false;

    for (let i = 0; i < this.length; i++) {
      if(!(this.letters[i].row === ws.letters[i].row
        && this.letters[i].col === ws.letters[i].col))
        return false;
    }      
    return true;
  }

  // в массиве есть такое же словоместо
  arrayHasSame(wsa: WordSite[]) : boolean
  {
    for (let i = 0; i < wsa.length; i++) {
      if(wsa[i].isEqualTo(this))
        return true;
    }
    return false;
  }

  getNextBusyLetterSite(
    fromPos: LetterSite | undefined
  ): LetterSite | undefined {
    let startIndex = 0;
    if (fromPos) {
      const fromIndex = this.letters.indexOf(fromPos);
      if (fromIndex !== -1) startIndex = fromIndex + 1;
      else {
        throw new Error("getNextBusyLetterSite: не найдем 'fromPos' ");
      }
    }
    for (let i = startIndex; i < this.length; i++) {
      if (!this.letters[i].isEmpty()) {
        return this.letters[i];
      }
    }
    return undefined;
  }

  getPrevBusyLetterSite(
    fromPos: LetterSite | undefined
  ): LetterSite | undefined {
    let startIndex = this.length - 1;
    if (fromPos) {
      const fromIndex = this.letters.indexOf(fromPos);
      if (fromIndex !== -1) {
        if (fromIndex === 0) return undefined;
        startIndex = fromIndex - 1;
      } else {
        throw new Error("getNextBusyLetterSite: не найдем 'fromPos' ");
      }
    }
    for (let i = startIndex; i >= 0; i--) {
      if (!this.letters[i].isEmpty()) {
        return this.letters[i];
      }
    }
    return undefined;
  }

  // для отладки: поисковый шаблон
  get pattern(): string {
    let str = "";
    this.letters.forEach(l => {
      if (l.isEmpty()) str += "*";
      else str += l.character;
    });
    return str;
  }

  // поисковый шаблон RegEx
  templateStr(): string {
    let pos = 0;
    let tStr = "^";
    this.letters.forEach(lt => {
      if (lt.isEmpty()) pos++;
      else {
        tStr += `.{${pos}}${lt.character}`;
        pos = 0;
      }
    });
    return tStr;
  }

  getTemplatesN(nPlaceHolders: number): WordSite[] {
    const allTemplates: WordSite[] = [];
    const thisWordSiteLength = this.length;
    for (let i = 0; i < thisWordSiteLength - nPlaceHolders; i++) {
      const wTemplate = new WordSite();
      for (let il = 0; il + i < thisWordSiteLength; il++) {
        // вероятно ещё нужен предикат буквоместа типа canUseIn(vert,horz)Word
        wTemplate.push(this.letters[il + i]);
        if (wTemplate.emptyCount === nPlaceHolders) {
          for (let iNext = il + i + 1; iNext < this.length; iNext++) {
            const ltNext = this.letters[iNext];
            if (!ltNext.isEmpty()) wTemplate.push(ltNext);
            else break;
          }
          break;
        }
      }
      if (
        wTemplate.length > 1 &&
        // есть хотя бы одна буква, неважно этого хода или предыдущих
        wTemplate.emptyCount < wTemplate.length
      )
        allTemplates.push(wTemplate);
    }
    return allTemplates;
  }

  // "фиксация" позиции буквы: очистка флагов
  fixLetters() {
    this.letters.forEach(lt => {
      lt.letter?.clean();
    });
  }

  // методы как массива буквомест
  push(...letterSiteArr: LetterSite[]): void {
    this.letters.push(...letterSiteArr);
  }

  get length(): number {
    return this.letters.length;
  }

  set length(value: number) {
    this.letters.length = value;
  }
}
