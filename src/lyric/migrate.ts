import { Lyric } from './lyric.type';

type Time = string | number;

const isDigit = (x: any) => !isNaN(Number(x));

function plus(num1: number, num2: number, ...others: number[]): number {
    // 精確加法
    if (others.length > 0) return plus(plus(num1, num2), others[0], ...others.slice(1));
    const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
    return (times(num1, baseNum) + times(num2, baseNum)) / baseNum;
}

function digitLength(num: number): number {
    // Get digit length of e
    const eSplit = num.toString().split(/[eE]/);
    const len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0);
    return len > 0 ? len : 0;
}

function times(num1: number, num2: number, ...others: number[]): number {
    // 精確乘法
    function checkBoundary(num: number) {
        if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
            console.warn(
                `${num} is beyond boundary when transfer to integer, the results may not be accurate`
            );
        }
    }

    function float2Fixed(num: number): number {
        if (num.toString().indexOf('e') === -1) return Number(num.toString().replace('.', ''));
        const dLen = digitLength(num);
        return dLen > 0 ? num * Math.pow(10, dLen) : num;
    }

    if (others.length > 0) return times(times(num1, num2), others[0], ...others.slice(1));
    const num1Changed = float2Fixed(num1);
    const num2Changed = float2Fixed(num2);
    const baseNum = digitLength(num1) + digitLength(num2);
    const leftValue = num1Changed * num2Changed;

    checkBoundary(leftValue);

    return leftValue / Math.pow(10, baseNum);
}
function minus(num1: number, num2: number, ...others: number[]): number {
    // 精確減法
    if (others.length > 0) return minus(minus(num1, num2), others[0], ...others.slice(1));
    const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
    return (times(num1, baseNum) - times(num2, baseNum)) / baseNum;
}

function tagToTime(tag: string) {
    return isDigit(tag[0])
        ? tag
              .split(':')
              .reverse()
              .reduce((acc, cur, index) => plus(acc, Number(cur) * 60 ** index), 0)
        : tag;
}

function parse(x: Lyric, isTranslated = false): [Time, Lyric, boolean][] {
    let pLyricLines = x
        .split('\n')
        .filter(x => x != '')
        .map(str => {
            const regex = /\[(\d+:\d+\.\d+)\]/gm;
            let m: RegExpExecArray;

            let result = [];

            while ((m = regex.exec(str)) !== null) {
                if (m.index === regex.lastIndex) regex.lastIndex++;
                result.push(m[1]);
            }
            result.push(str.match(/.+\]((?:.|^$)*)/)[1]);
            return result;
        });
    let result: [Time, Lyric, boolean][] = [];
    for (let pLyricLine of pLyricLines) {
        let lyric = pLyricLine.pop();
        for (let time of pLyricLine) {
            result.push([tagToTime(time), lyric, isTranslated]);
        }
    }
    return result;
}

function migrate(org: Lyric, t: Lyric, offset: number = 10 ** -3): Lyric {
    const timeToTag = (seconds: number) => {
        let minute = Math.floor(seconds / 60);
        let second = minus(seconds, minute * 60);
        return `${minute}:${second}`;
    };

    // 開始切成 [(tag, lyric)]

    let parsedLyrics = parse(org)
        .concat(parse(t, true))
        .sort((a, b) => {
            if (typeof a[0] == 'string') return -1;
            else if (typeof b[0] == 'string') return 1;
            else {
                if (a[0] == b[0]) return a[2] ? 1 : -1;
                else return a[0] < b[0] ? -1 : 1;
            }
        });

    // 整理成 [[time, [orgLyric, tLyric]]]
    let parsedLyricPairs: ([Time, string, boolean] | [Time, [string, string]])[] = [];

    let i = 0;
    while (i < parsedLyrics.length) {
        if (typeof parsedLyrics[i][0] == 'string') {
            parsedLyricPairs.push(parsedLyrics[i]);
            i += 1;
        } else if (i != parsedLyrics.length - 1) {
            if (parsedLyrics[i][0] == parsedLyrics[i + 1][0]) {
                parsedLyricPairs.push([
                    parsedLyrics[i][0],
                    [parsedLyrics[i][1], parsedLyrics[i + 1][1]]
                ]);
                i += 2;
            } else {
                parsedLyricPairs.push([
                    parsedLyrics[i][0],
                    [parsedLyrics[i][1], parsedLyrics[i][1]]
                ]);
                i += 1;
            }
        } else {
            parsedLyricPairs.push([parsedLyrics[i][0], [parsedLyrics[i][1], parsedLyrics[i][1]]]);
            i += 1;
        }
    }

    // 壓回 LRC
    let result = '';
    for (let j in parsedLyricPairs) {
        i = Number(j);
        if (typeof parsedLyricPairs[i][0] == 'string') result += `[${parsedLyricPairs[i][0]}]\n`;
        else {
            if (i != parsedLyricPairs.length - 1) {
                result += `[${timeToTag(Number(parsedLyricPairs[i][0]))}]${
                    parsedLyricPairs[i][1][0]
                }\n[${timeToTag(plus(Number(parsedLyricPairs[i + 1][0]), -offset))}]${
                    parsedLyricPairs[i][1][1]
                }\n`;
            } else {
                result += `[${timeToTag(Number(parsedLyricPairs[i][0]))}]${
                    parsedLyricPairs[i][1][0]
                }\n[${timeToTag(Number(parsedLyricPairs[i][0]))}]${parsedLyricPairs[i][1][1]}\n`;
            }
        }
    }

    return result;
}

export { migrate };
