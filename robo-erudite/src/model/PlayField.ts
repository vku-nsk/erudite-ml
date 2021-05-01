import { Letter } from "./Letter";
import { LetterSite } from "./LetterSite";
import { LetterBank } from "./LetterBank";
import { WordSite } from "./WordSite";

export class PlayField {
  gridSize: number;
  // игровая поляна
  cellGrid: LetterSite[][];
  // буквоместа текущего хода; их можно изменять
  cellsInTheGo: LetterSite[];
  // слова на поляне
  usedWords: string[];
  // общий банк букв
  letterBank: LetterBank;
  // слова текущего хода активного игрока
  wordsInTheGo: WordSite[];
  // слова предыдущего завершённого хода
  wordsInPrevGo: WordSite[];
  //
  prevGoPlayerId: number;

  constructor(gridSize: number, wordsInTheGo: WordSite[]) {
    this.gridSize = gridSize;
    this.cellGrid = this.generateCells();
    this.letterBank = new LetterBank();
    this.cellsInTheGo = [];
    this.usedWords = [];
    this.wordsInPrevGo = [];
    this.prevGoPlayerId=-1;
    this.wordsInTheGo = wordsInTheGo;
  }

  saveCellGrid(): Blob {
    const data = JSON.stringify(this.cellGrid);
    const blob = new Blob([data], { type: "application/json" });
    return blob;
  }

  loadCellGrid(jsonText: string) {
    const pt = JSON.parse(jsonText);
    const exData = pt as LetterSite[][];
    for (let iRow = 0; iRow < exData.length; iRow++) {
      const row = exData[iRow];
      for (let jCol = 0; jCol < row.length; jCol++) {
        const exCell = row[jCol];
        this.cellGrid[iRow][jCol].row = exCell.row;
        this.cellGrid[iRow][jCol].col = exCell.col;
        this.cellGrid[iRow][jCol].letter = exCell.letter;
        this.cellGrid[iRow][jCol].idPlayer = exCell.idPlayer;
      }
    }
  }

  putLetterInCell(
    iRow: number,
    jCol: number,
    letter: Letter,
    idPlayer: number
  ): boolean {
    if (iRow < this.gridSize && jCol < this.gridSize) {
      const activeCell = this.cellGrid[iRow][jCol];
      letter.flagged = true;
      activeCell.setLetter(letter, idPlayer);
      if (this.cellsInTheGo.indexOf(activeCell) === -1) {
        this.cellsInTheGo.push(activeCell);
      }
      this.wordsInTheGo.length = 0;
      this.wordsInTheGo.push(...this.collectWorsOfTheGo());
      return true;
    } else {
      console.log("Invalid cell indexies");
      return false;
    }
  }

  removeLetter(letterOnField: LetterSite) {
    const inGoCellsIndex=this.cellsInTheGo.indexOf(letterOnField);
    if (inGoCellsIndex !== -1) {
      this.cellsInTheGo.splice(inGoCellsIndex, 1);
    }
    this.cellGrid[letterOnField.row][letterOnField.col] = new LetterSite(
      letterOnField.row,
      letterOnField.col
    );
    this.wordsInTheGo.length = 0;
    this.wordsInTheGo.push(...this.collectWorsOfTheGo());
  }

  wordAlreadyUsed(word: string): boolean {
    return this.usedWords.some(w => {
      return w === word;
    });
  }

  isLetterInPrevGo(lt: LetterSite): boolean {
    const allLetterSites: LetterSite[]=[];
    this.wordsInPrevGo.forEach( (w) => {
      w.letters.forEach( (lt) => {
        if(!allLetterSites.includes(lt))
        allLetterSites.push(lt);
      });
    });  
    const bIn=allLetterSites.includes(lt);

    return bIn;
  }

  afterGoComplete(idPlayer: number) {
    this.wordsInPrevGo.length=0;
    this.wordsInTheGo.forEach(ws => {
      const str = ws.str;
      if (str.length !== 0){
        this.usedWords.push(str);
        ws.letters.forEach(lt => lt.idPlayer=idPlayer);
        this.wordsInPrevGo.push(ws);
      }
    });
    if(this.wordsInTheGo.length !== 0)
      this.prevGoPlayerId=idPlayer;  
    else
      this.prevGoPlayerId=-1;  

    // фиксация ячеек
    this.cellsInTheGo.forEach(lt => {
      lt.letter?.clean();
    });
    this.cellsInTheGo.length=0;
  }

  // имеется ли сосед по вертикали или горизонтали
  letterHasHeighbor(letterOnPlayField: LetterSite): boolean {
    if (letterOnPlayField.row + 1 < this.gridSize) {
      if (
        !this.cellGrid[letterOnPlayField.row + 1][
          letterOnPlayField.col
        ].isEmpty()
      ) {
        return true;
      }
    }
    if (letterOnPlayField.row > 0) {
      if (
        !this.cellGrid[letterOnPlayField.row - 1][
          letterOnPlayField.col
        ].isEmpty()
      ) {
        return true;
      }
    }
    if (letterOnPlayField.col + 1 < this.gridSize) {
      if (
        !this.cellGrid[letterOnPlayField.row][
          letterOnPlayField.col + 1
        ].isEmpty()
      ) {
        return true;
      }
    }
    if (letterOnPlayField.col > 0) {
      if (
        !this.cellGrid[letterOnPlayField.row][
          letterOnPlayField.col - 1
        ].isEmpty()
      ) {
        return true;
      }
    }
    return false;
  }

  lettersInTheGoHaveHeighbors(): boolean {
    return !this.cellsInTheGo.some(el => {
      return !this.letterHasHeighbor(el);
    });
  }

  //#region формирование слов
  isFirstLetterOfHorzWord(letterSite: LetterSite): boolean {
    if (
      (letterSite.col == 0 ||
        this.cellGrid[letterSite.row][letterSite.col - 1].isEmpty()) &&
      letterSite.col + 1 < this.gridSize &&
      !this.cellGrid[letterSite.row][letterSite.col + 1].isEmpty()
    ) {
      return true;
    }
    return false;
  }

  isFirstLetterOfVertWord(letterSite: LetterSite): boolean {
    if (
      (letterSite.row == 0 ||
        this.cellGrid[letterSite.row - 1][letterSite.col].isEmpty()) &&
      letterSite.row + 1 < this.gridSize &&
      !this.cellGrid[letterSite.row + 1][letterSite.col].isEmpty()
    ) {
      return true;
    }
    return false;
  }

  private buildHorzWord(letterSite: LetterSite): WordSite {
    const horizontalWord = new WordSite();
    for (let ic = letterSite.col; ic < this.gridSize; ic++) {
      if (this.cellGrid[letterSite.row][ic].isEmpty()) {
        break;
      } else {
        horizontalWord.push(this.cellGrid[letterSite.row][ic]);
      }
    }
    return horizontalWord;
  }

  private buildVertWord(letterSite: LetterSite): WordSite {
    const horizontalWord: WordSite = new WordSite();
    for (let ir = letterSite.row; ir < this.gridSize; ir++) {
      if (this.cellGrid[ir][letterSite.col].isEmpty()) {
        break;
      } else {
        horizontalWord.push(this.cellGrid[ir][letterSite.col]);
      }
    }
    return horizontalWord;
  }

  private buildAllHorzWords(allCells: LetterSite[]): WordSite[] {
    const allHorzWords: WordSite[] = [];
    for (let i = 0; i < allCells.length; i++) {
      if (this.isFirstLetterOfHorzWord(allCells[i])) {
        const horzWord: WordSite = this.buildHorzWord(allCells[i]);
        if (horzWord.length > 1) allHorzWords.push(horzWord);
      }
    }
    return allHorzWords;
  }

  private buildAllVertWords(allCells: LetterSite[]): WordSite[] {
    const allVertWords: WordSite[] = [];
    for (let i = 0; i < allCells.length; i++) {
      if (this.isFirstLetterOfVertWord(allCells[i])) {
        const vertWord: WordSite = this.buildVertWord(allCells[i]);
        if (vertWord.length > 1) allVertWords.push(vertWord);
      }
    }
    return allVertWords;
  }

  collectAllWordsOnPlayfield(): WordSite[] {
    const allBusyCells = this.cellGrid.flat().filter(lt => {
      return !lt.isEmpty();
    });
    // console.log(`Сбор слов от ${allBusyCells.length} занятых ячеек`);
    const allWords = this.buildAllHorzWords(allBusyCells);
    allWords.push(...this.buildAllVertWords(allBusyCells));
    return allWords;
  }

  // слова текущего хода
  collectWorsOfTheGo(): WordSite[] {
    const wordsFiltered: WordSite[] = [];
    const allWords = this.collectAllWordsOnPlayfield();
    allWords.forEach(word => {
      if (
        word.letters.some(lt => {
          return lt.isInGo;
        })
      ) {
        wordsFiltered.push(word);
      }
    });
    return wordsFiltered;
  }
  //#endregion  формирование слов

  //#region шаблоны для создания слов роботом

  //#region вертикальные шаблоны

  private buildColumnStartTemplate(jCol: number, wLen: number): WordSite {
    const startTemplate = new WordSite();
    for (let iRow = 0; iRow < wLen; iRow++) {
      startTemplate.push(this.cellGrid[iRow][jCol]);
    }
    return startTemplate;
  }

  // проверка буквоместа горизонтального слова
  private checkColumnTemplateLetter(lt: LetterSite): boolean {
    if (!lt.isEmpty())
      // ранее поставленная буква должна быть в слове по вертикали
      return true;
    // слева от пустого буквоместа не должно быть буквы
    if (!(lt.col === 0 || this.cellGrid[lt.row][lt.col - 1].isEmpty()))
      return false;
    // справа от пустого буквоместа не должно быть буквы
    if (
      !(
        lt.col === this.gridSize - 1 ||
        this.cellGrid[lt.row][lt.col + 1].isEmpty()
      )
    )
      return false;
    return true;
  }

  private checkColumnTemplate(templ: WordSite): boolean {
    if (templ.length < 2) return false;
    // должна быть хотя бы 1 ранее поставленная буква
    if (!templ.hasNotInGoLetter) return false;
    // должа быть хотя бы 1 пустая ячейка
    if (templ.emptyCount === 0) return false;
    // сверху от первой буквы нет буквы
    const firstLetterOk =
      templ.letters[0].row === 0 ||
      this.cellGrid[templ.letters[0].row - 1][templ.letters[0].col].isEmpty();
    if (!firstLetterOk) return false;
    // снизу от последней буквы нет буквы
    const ll = templ.length - 1;
    const lastLetterOk =
      templ.letters[ll].row === this.gridSize - 1 ||
      this.cellGrid[templ.letters[ll].row + 1][templ.letters[ll].col].isEmpty();
    if (!lastLetterOk) return false;
    const ltCheck = templ.letters.every(lt => {
      return this.checkColumnTemplateLetter(lt);
    });
    return ltCheck;
  }

  private columnTemplateMoveDown(colWT: WordSite): WordSite | undefined {
    const wtLen = colWT.length;
    if (colWT.letters[wtLen - 1].row + 1 >= this.gridSize) return undefined;
    const shiftWT = new WordSite();
    for (let i = 1; i < wtLen; i++) {
      shiftWT.letters.push(colWT.letters[i]);
    }
    const jCol = shiftWT.letters[shiftWT.letters.length - 1].col;
    const iRow = shiftWT.letters[shiftWT.letters.length - 1].row + 1;
    shiftWT.push(this.cellGrid[iRow][jCol]);
    return shiftWT;
  }

  private buildTemplatesForColumn(jCol: number): WordSite[] {
    const wordTemplates: WordSite[] = [];
    for (let wLen = this.gridSize; wLen >= 2; wLen--) {
      let rowWT: WordSite | undefined = this.buildColumnStartTemplate(
        jCol,
        wLen
      );
      do {
        if (this.checkColumnTemplate(rowWT)) wordTemplates.push(rowWT);
        rowWT = this.columnTemplateMoveDown(rowWT);
      } while (rowWT);
    }
    return wordTemplates;
  }

  // массивы шаблонов от макс. длины к мин. длине
  // numAvail - число доступных для постановки букв
  templatesForColumns(numAvail: number): WordSite[][] {
    const wordTemplates: WordSite[][] = [];
    const minWLen = 2;
    const maxWLen = this.gridSize;
    for (let wLen = maxWLen; wLen >= minWLen; wLen--) {
      const arrOfLen: WordSite[] = [];
      wordTemplates.push(arrOfLen);
    }
    // в каждом массиве шаблоны определённой длины
    for (let jCol = 0; jCol < this.gridSize; jCol++) {
      const rowTemplates = this.buildTemplatesForColumn(jCol);
      rowTemplates.forEach(wta => {
        if (wta.emptyCount <= numAvail)
          // число пустых в шаблоне должно не превышать число доступных
          wordTemplates[maxWLen - wta.length].push(wta);
      });
    }
    return wordTemplates;
  }

  //#endregion вертикальные шаблоны
  //#region горизонтальные шаблоны

  // проверка буквоместа горизонтального слова
  private checkRowTemplateLetter(lt: LetterSite): boolean {
    if (!lt.isEmpty())
      // ранее поставленная буква должна быть в слове по вертикали
      return true;
    // сверху от пустого буквоместа не должно быть буквы
    if (!(lt.row === 0 || this.cellGrid[lt.row - 1][lt.col].isEmpty()))
      return false;
    // снизу от пустого буквоместа не должно быть буквы
    if (
      !(
        lt.row === this.gridSize - 1 ||
        this.cellGrid[lt.row + 1][lt.col].isEmpty()
      )
    )
      return false;
    return true;
  }

  private checkRowTemplate(templ: WordSite): boolean {
    if (templ.length < 2) return false;
    // должна быть хотя бы 1 ранее поставленная буква
    if (!templ.hasNotInGoLetter) return false;
    // должа быть хотя бы 1 пустая ячейка
    if (templ.emptyCount === 0) return false;
    // слева от первой буквы нет буквы
    const firstLetterOk =
      templ.letters[0].col === 0 ||
      this.cellGrid[templ.letters[0].row][templ.letters[0].col - 1].isEmpty();
    if (!firstLetterOk) return false;
    // справа от последней буквы нет буквы
    const ll = templ.length - 1;
    const lastLetterOk =
      templ.letters[ll].col === this.gridSize - 1 ||
      this.cellGrid[templ.letters[ll].row][templ.letters[ll].col + 1].isEmpty();
    if (!lastLetterOk) return false;
    const ltCheck = templ.letters.every(lt => {
      return this.checkRowTemplateLetter(lt);
    });
    return ltCheck;
  }

  private buildRowStartTemplate(iRow: number, wLen: number): WordSite {
    const startTemplate = new WordSite();
    for (let jCol = 0; jCol < wLen; jCol++) {
      startTemplate.push(this.cellGrid[iRow][jCol]);
    }
    return startTemplate;
  }

  private rowTemplateMoveRight(rowWT: WordSite): WordSite | undefined {
    const wtLen = rowWT.length;
    if (rowWT.letters[wtLen - 1].col + 1 >= this.gridSize) return undefined;
    const shiftWT = new WordSite();
    for (let i = 1; i < wtLen; i++) {
      shiftWT.letters.push(rowWT.letters[i]);
    }
    const jCol = shiftWT.letters[shiftWT.letters.length - 1].col + 1;
    const iRow = shiftWT.letters[shiftWT.letters.length - 1].row;
    shiftWT.push(this.cellGrid[iRow][jCol]);
    return shiftWT;
  }

  private buildTemplatesForRow(iRow: number): WordSite[] {
    const wordTemplates: WordSite[] = [];
    for (let wLen = this.gridSize; wLen >= 2; wLen--) {
      let rowWT: WordSite | undefined = this.buildRowStartTemplate(iRow, wLen);
      do {
        if (this.checkRowTemplate(rowWT)) wordTemplates.push(rowWT);
        rowWT = this.rowTemplateMoveRight(rowWT);
      } while (rowWT);
    }
    return wordTemplates;
  }

  // массивы шаблонов от макс. длины к мин. длине
  // numAvail - число доступных для постановки букв
  templatesForRows(numAvail: number): WordSite[][] {
    const wordTemplates: WordSite[][] = [];
    const minWLen = 2;
    const maxWLen = this.gridSize;
    for (let wLen = maxWLen; wLen >= minWLen; wLen--) {
      const arrOfLen: WordSite[] = [];
      wordTemplates.push(arrOfLen);
    }
    // в каждом массиве шаблоны определённой длины
    for (let iRow = 0; iRow < this.gridSize; iRow++) {
      const rowTemplates = this.buildTemplatesForRow(iRow);
      rowTemplates.forEach(wta => {
        if (wta.emptyCount <= numAvail)
          // число пустых в шаблоне должно не превышать число доступных
          wordTemplates[maxWLen - wta.length].push(wta);
      });
    }
    return wordTemplates;
  }

  //#endregion горизонтальные шаблоны

  //#endregion шаблоны для создания слов роботом

  private generateCells(): LetterSite[][] {
    const cellArray: LetterSite[][] = [];

    for (let iRow = 0; iRow < this.gridSize; iRow++) {
      const rowCells: LetterSite[] = [];
      for (let jCol = 0; jCol < this.gridSize; jCol++) {
        rowCells.push(new LetterSite(iRow, jCol));
      }
      cellArray.push(rowCells);
    }
    return cellArray;
  }
}
