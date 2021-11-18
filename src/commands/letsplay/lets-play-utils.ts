import settings from "../../settings.json";

export default class LetsPlayUtils {
    public static getCategoryIds(category: string = "default"): number[] {
        return (settings.letsplay.categories as any)[category];
    }
}
