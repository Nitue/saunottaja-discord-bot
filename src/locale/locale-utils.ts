import _ from "lodash";

export default class LocaleUtils {
    public static process(localeString: string, variables: string[]): string {
        return _.reduce(variables, (finalString, variable, index) => {
            return finalString.replace(new RegExp(`\\{${index}\\}`, 'g'), variable)
        }, localeString);
    }
}
