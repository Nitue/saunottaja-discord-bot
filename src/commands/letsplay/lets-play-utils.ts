import {Message} from "discord.js";
import settings from "../../settings.json";

export default class LetsPlayUtils {
    public static getCategoryIds(message: Message): number[] {
        const categoryGroup = LetsPlayUtils.getCategoryGroup(message);
        return (settings.letsplay.categories as any)[categoryGroup];
    }

    public static getCategoryGroup(message: Message): string {
        const args = message.content.split(' ');
        const categoryGroups = Object.keys(settings.letsplay.categories);
        const categoryGroup = args.find(arg => categoryGroups.includes(arg));
        return categoryGroup === undefined ? 'default' : categoryGroup;
    }
}
