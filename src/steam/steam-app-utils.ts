import settings from '../settings.json';

export default class SteamAppUtils {
    public static getStoreURL(appId: number): string {
        return `https://store.steampowered.com/app/${appId}`;
    }

    public static getCategoryName(categoryId: number): string {
        return (settings.steam.categories as any)[`${categoryId}`];
    }
}
