import { Letter } from "./Letter";
import { LetterSite } from "./LetterSite";
import { WordSite } from "./WordSite";

export class Player {
  maxNumLetters = 7;
  // интерактивный, иначе - робот
  interartive = false;
  // активный
  active = false;
  // идентификатор игрока
  id = 0;
  // общее число сделанных ходов
  numGo = 0;
  // число пропущенных подряд ходов
  numSkippedGo = 0;
  // бонусные очки
  extraPoints = 0;
  // буквы игрока
  chars: Letter[]=[];
  // тек. буква для помещения на поле
  currentLetter: Letter | undefined;
  // слова текущего хода
  wordsInTheGo: WordSite[]=[];
  // все слова игрока в текущей игре
  allWords: WordSite[]=[];

  constructor(playerId: number, interactive: boolean) {
    this.interartive = interactive;
    this.id = playerId;
  }

  get needChars() {
    return this.maxNumLetters - this.chars.length;
  }

  // очки текущего хода
  get goPoints(): number {
    let pts = 0;
    this.wordsInTheGo.forEach(w => {
      pts += this.calcWordWorth(w);
    });
    return pts;
  }

  get totalPoints(): number {
    let pts = 0;
    this.allWords.forEach(l => {
      pts += this.calcWordWorth(l);
    });
    pts+=this.extraPoints;
    return pts;
  }

  // буквоместо использовано хотя бы в одном слове хода
  letterSiteInGoWords(lt: LetterSite): boolean
  {
    const allLetterSites: LetterSite[]=[];
    this.wordsInTheGo.forEach( (w) => {
        allLetterSites.push(...w.letters);
    });  
    const bIn=allLetterSites.includes(lt);

    return bIn;
  }

  private calcWordWorth(word: WordSite): number
  {
    return word.points;
  }

  // словоместо присутствует среди слов текущего хода 
  wordSiteIsPresentInTheGo(word: WordSite): boolean
  {
    return this.wordsInTheGo.some( (wsInGo) => { return wsInGo.isEqualTo(word);} );
  }

  // слова игрока отсортированные по убыванию ценности
  wordsByWorth() : WordSite[] 
  {
    return this.allWords.sort( (a,b) =>
    {
      const pointsA=this.calcWordWorth(a);
      const pointsB=this.calcWordWorth(b);
      return pointsB - pointsA;
    } );
  }

  // хотя бы одно слово хода пересекается с ранее поставленными
  private wordsInGoHaveNotInGoLetter() : boolean
  {
    return this.wordsInTheGo.some( (w)=> {return w.hasNotInGoLetter;} );
  }

  // слово пересекается с ранее поставленными или со словами текущего хода
  wordInTheGoHasProperIntersection(word: WordSite) : boolean
  {
    if(word.hasNotInGoLetter)
      return true;
    const otherLetterSites: LetterSite[]=[];
    this.wordsInTheGo.forEach( (w) => {
      if(w !== word)
        otherLetterSites.push(...w.letters);
    });  
    return word.letters.some( (l) => {return otherLetterSites.includes(l);});
  }

  // все слова хода имеют надлежащие пересечения
  wordsInTheGoHaveValidIntersections(): boolean
  {
    if(this.wordsInGoHaveNotInGoLetter()){
      return this.wordsInTheGo.every( (w) => { return this.wordInTheGoHasProperIntersection(w);} )
    }
    return false;
  }

  addChars(...letters: Letter[]): void {
    for (
      let i = 0;
      i < letters.length && this.chars.length < this.maxNumLetters;
      i++
    ) {
      letters[i].clean();
      this.chars.push(letters[i]);
    }
  }

  afterGoComplete() {
    this.numGo++;
    if (this.wordsInTheGo.length === 0) {
      this.numSkippedGo++;
    } else {
      this.numSkippedGo = 0;
      this.allWords.push(...this.wordsInTheGo);
      this.wordsInTheGo.forEach(w => {
        w.fixLetters();
      });
    }
    this.wordsInTheGo.length = 0;
    this.currentLetter = undefined;
  }
}
