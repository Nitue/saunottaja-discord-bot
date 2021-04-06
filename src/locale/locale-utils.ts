import _ from "lodash";
import en from "../resources/locale/en.json";
import fs from "fs";
import path from "path";

const localeJson = fs.readFileSync(path.resolve(__dirname, `../resources/locale/${process.env.BOT_LANGUAGE}.json`), 'utf-8');

export class LocaleUtils {
    public static process(localeString: string, variables: string[]): string {
        return _.reduce(variables, (finalString, variable, index) => {
            return finalString.replace(new RegExp(`\\{${index}\\}`, 'g'), variable)
        }, localeString);
    }
}

export const locale = JSON.parse(localeJson) as typeof en;