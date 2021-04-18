import { Letter } from "./Letter";

// буква на поляне
export class LetterSite {
  row: number;
  col: number;
  letter: Letter | undefined;
  // ид игрока;
  idPlayer = -1;

  constructor(iRow: number, jCol: number) {
    this.letter = undefined;
    this.row = iRow;
    this.col = jCol;
  }

  get character() {
    if (this.letter) {
      return this.letter.character;
    } else {
      return "";
    }
  }

  get points() {
    if (this.letter) {
      return this.letter.points;
    } else {
      return 0;
    }
  }

  // использована в незавершенном ходе
  get isInGo(): boolean {
    if (this.letter) {
      return this.letter.flagged;
    } else {
      return false;
    }
  }

  setLetter(letter?: Letter, idPlayer?: number): void {
    this.letter = letter;
    if (idPlayer === undefined) this.idPlayer = -1;
    else this.idPlayer = idPlayer;
  }

  isEmpty(): boolean {
    return !this.letter || this.letter.character === "";
  }
}
