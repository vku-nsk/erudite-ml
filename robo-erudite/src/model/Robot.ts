import { Letter } from "./Letter";
import { WordSite } from "./WordSite";
import { LetterBank } from "./LetterBank";
import { PlayField } from "./PlayField";
import { Dictionary } from "./Dictionary";
import { LetterSite } from "./LetterSite";

type SearchResult = { ws: WordSite; word: string } | undefined;

export class Robot {
  // словарь
  gameDictionary: Dictionary;
  // игровая поляна
  playField: PlayField;
  // доступные буквы
  letters: Letter[] = [];

  constructor(dictionary: Dictionary, field: PlayField) {
    this.gameDictionary = dictionary;
    this.playField = field;
  }

  canPutInWordSite(word: string, ws: WordSite, outWS: WordSite): boolean {
    if (this.playField.wordAlreadyUsed(word)) {
      console.log(`слово "${word}" уже использовано`);
      return false;
    }
    let success = true;
    const availLetters: Letter[] = [];

    outWS.letters.length = 0;
    if (word.length > ws.length) return false;
    this.letters.forEach(lt => {
      availLetters.push(new Letter(lt.character, lt.points));
    });
    for (let i = 0; i < ws.length; i++) {
      if (ws.letters[i].isEmpty()) {
        const ch = word[i];
        const aInd = availLetters.findIndex(lt => {
          return lt.character === ch;
        });
        if (aInd === -1) {
          success = false;
          break;
        } else {
          const rmLetter = availLetters.splice(aInd, 1);
          const letterSite = new LetterSite(
            ws.letters[i].row,
            ws.letters[i].col
          );
          letterSite.letter = new Letter(
            rmLetter[0].character,
            rmLetter[0].points
          );
          outWS.push(letterSite);
          if (availLetters.length === 0) {
            success = false;
            break;
          }
        }
      }
    }
    return success;
  }

  selectWordForSiteByAvailLetters(
    wordsOfFixLen: string[],
    ws: WordSite
  ): SearchResult {
    const wordSiteTemlate = ws.templateStr();
    const regexp = new RegExp(wordSiteTemlate);

    for (let i = 0; i < wordsOfFixLen.length; i++) {
      const w = wordsOfFixLen[i];
      if (regexp.test(w)) {
        const outWS = new WordSite();
        if (this.canPutInWordSite(w, ws, outWS)) {
          return { ws: outWS, word: w };
        }
      }
    }
    return undefined;
  }

  getClue(
    letters: Letter[],
    minWlen: number,
    maxWlen: number
  ): WordSite | undefined {
    this.letters = letters;
    let resultWS: SearchResult = undefined;
    const gSize = this.playField.gridSize;
    let nLen = Math.min(maxWlen, gSize);
    for (let pass = 0; pass < 2; pass++) {
      const templateWordSites =
        pass === 0
          ? this.playField.templatesForColumns(letters.length)
          : this.playField.templatesForRows(letters.length);
      for (; nLen >= minWlen; nLen--) {
        // const dirTimerId = (pass === 0 ? "VERT:" : "HORZ:") + `wLen${nLen}`;
        // console.time(dirTimerId);
        let wordWSpass:SearchResult = undefined;
        for (let i = 0; i < templateWordSites[gSize - nLen].length; i++) {
          const tws = templateWordSites[gSize - nLen][i];
          // console.log(`nLen=${nLen} i=${i} ptn=${tws.pattern}`);
          const wordsOfLength = this.gameDictionary.getWordsOfLength(
            tws.length
          );
          wordWSpass = this.selectWordForSiteByAvailLetters(
            wordsOfLength,
            tws
          );
          if (wordWSpass) {
            if (resultWS) {
              if (wordWSpass.word.length > resultWS.word.length)
                resultWS = wordWSpass;
              else if (wordWSpass.word.length === resultWS.word.length) {
                if (LetterBank.wordCost(wordWSpass.word) > LetterBank.wordCost(resultWS.word))
                  resultWS = wordWSpass;
              } else break;
            } else resultWS = wordWSpass;
          }
        }
        // console.timeEnd(dirTimerId);
        if (resultWS) break;
      }
      if (pass == 0) {
          // на втором проходе ищем слово не короче найденного
        if (resultWS)
          minWlen = resultWS.word.length;
        nLen = Math.min(maxWlen, gSize);
        if(resultWS){
          console.log(`pass0 word ${resultWS.word}, minWlen=${minWlen}`)
        }
      }
    }
//    if (!resultWS) console.log("Не удалось найти слово");
    this.letters = [];
    return resultWS?.ws;
  }
}
