declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    toString(): string;
    getXingZuo(): string;
  }

  export class Lunar {
    static fromDate(date: Date): Lunar;
    toFullString(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getWeek(): string;
    getDayInGanZhi(): string;
  }
}
