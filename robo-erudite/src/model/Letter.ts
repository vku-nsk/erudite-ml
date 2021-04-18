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

  // "как новая" (т.е. очистить флаги)
  clean() {
    this.flagged = false;
  }
}
