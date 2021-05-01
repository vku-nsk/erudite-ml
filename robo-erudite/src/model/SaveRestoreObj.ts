import { PlayField } from "./PlayField";
import { Player } from "./Player";
import { Letter } from "./Letter";

export class SaveRestoreObj {
  playField: PlayField;
  player0: Player;
  player1: Player;

  constructor(playField: PlayField, player0: Player, player1: Player) {
    this.playField=playField;
    this.player0=player0;
    this.player1=player1;
  }

  save(): Blob {
    const data = JSON.stringify(this, undefined, 2);
    const blob = new Blob([data], { type: "application/json" });
    return blob;
  }

  restore(jsonText: string) {
    const parsedObj = JSON.parse(jsonText);
    const exData = parsedObj as SaveRestoreObj;
    if(this.playField.cellGrid.length === exData.playField.cellGrid.length){
      for (let iRow = 0; iRow < exData.playField.cellGrid.length; iRow++) {
        const row = exData.playField.cellGrid[iRow];
        for (let jCol = 0; jCol < row.length; jCol++) {
          const exCell = row[jCol];
          this.playField.cellGrid[iRow][jCol].row = exCell.row;
          this.playField.cellGrid[iRow][jCol].col = exCell.col;
          const lt=new Letter(exCell.letter?.character, exCell.letter?.points);
          this.playField.cellGrid[iRow][jCol].letter = lt;
          this.playField.cellGrid[iRow][jCol].idPlayer = -1;// exCell.idPlayer;
        }
      }
      this.playField.cellsInTheGo.length=0;
      this.playField.prevGoPlayerId=-1;
      this.playField.usedWords.length=0;
      this.playField.wordsInPrevGo.length=0;
      this.playField.wordsInTheGo.length=0;

      this.player0.chars.length=0;
      exData.player0.chars.forEach( ch => {
        const lt=new Letter(ch.character, ch.points);
        this.player0.addChars(lt);
      });
      this.player0.allWords.length=0;
      this.player0.currentLetter=undefined;
      this.player0.extraPoints=0;
      this.player0.numGo=0;
      this.player0.numSkippedGo=0;
      this.player0.selectForChange=false;
      this.player0.active=false;

      this.player1.chars.length=0;
      exData.player1.chars.forEach( ch => {
        const lt=new Letter(ch.character, ch.points);
        this.player1.addChars(lt);
      });
      this.player1.allWords.length=0;
      this.player1.currentLetter=undefined;
      this.player1.extraPoints=0;
      this.player1.numGo=0;
      this.player1.numSkippedGo=0;
      this.player1.selectForChange=false;
      this.player1.active=false;
    }
    
  }

}