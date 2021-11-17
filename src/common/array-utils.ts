import uniqueRandom from "unique-random";
import _ from "lodash";

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

    public static getOccurrences<T>(arrays: T[][]): _.Dictionary<number> {
        return _.countBy(_.flatten(arrays));
    }
}