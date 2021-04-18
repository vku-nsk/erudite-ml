import { Letter } from "./Letter";
import { WordSite } from "./WordSite";
// import { LetterBank } from "./model/LetterBank";
// import { Player } from "./model/Player";
import { PlayField } from "./PlayField";
import { Dictionary } from "./Dictionary";
import { LetterSite } from "./LetterSite";

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

  selectWorForSiteByAvailLetters(
    wordsOfFixLen: string[],
    ws: WordSite
  ): { ws: WordSite; word: string } | undefined {
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
    let resultWS: WordSite | undefined = undefined;
    const gSize = this.playField.gridSize;
    let nLen = Math.min(maxWlen, gSize);
    for (let pass = 0; pass < 2; pass++) {
      const templateWordSites =
        pass === 0
          ? this.playField.templatesForColumns(letters.length)
          : this.playField.templatesForRows(letters.length);
      for (; nLen >= minWlen; nLen--) {
        const dirTimerId = (pass === 0 ? "VERT:" : "HORZ:") + `wLen${nLen}`;
        // console.time(dirTimerId);
        for (let i = 0; i < templateWordSites[gSize - nLen].length; i++) {
          const tws = templateWordSites[gSize - nLen][i];
          // console.log(`nLen=${nLen} i=${i} ptn=${tws.pattern}`);
          const wordsOfLength = this.gameDictionary.getWordsOfLength(
            tws.length
          );
          const wordWSOut = this.selectWorForSiteByAvailLetters(
            wordsOfLength,
            tws
          );
          if (wordWSOut) {
            if (resultWS) {
              if (wordWSOut.ws.length > resultWS.length)
                resultWS = wordWSOut.ws;
              else if (wordWSOut.ws.length === resultWS.length) {
                // здесь неправильный подчсёт очков в wordWSOut.ws на месте уже поставленных букв пустоты
                if (wordWSOut.ws.points > resultWS.points)
                  resultWS = wordWSOut.ws;
              } else break;
            } else resultWS = wordWSOut.ws;
            // console.log(
            //   (pass === 0 ? "VERT: " : "HORZ: ") +
            //     `cлово найдено: ${wordWSOut.word}`
            // );
          }
        }
        // console.timeEnd(dirTimerId);
        if (resultWS) break;
      }
      if (pass == 0) {
        if (resultWS)
          // на втором проходе ищем слово не короче найденного
          nLen = resultWS.length;
        else nLen = Math.min(maxWlen, gSize);
      }
    }
//    if (!resultWS) console.log("Не удалось найти слово");
    this.letters = [];
    return resultWS;
  }
}
