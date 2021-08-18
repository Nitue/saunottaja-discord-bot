import uniqueRandom from "unique-random";

export default class ArrayUtils {
    public static getRandomValue<T>(values: T[]): T {
        const random = uniqueRandom(0, values.length - 1);
        return values[random()];
    }

    public static getMatchingValues<T>(arrays: T[][]): T[]  {
        return arrays.reduce((previousArray, nextArray) => {
            return previousArray.filter(x => nextArray.includes(x));
        });
    }
}