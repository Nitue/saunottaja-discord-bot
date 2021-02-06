import settings from '../settings.json';

export default class SteamAppUtils {

    public static ERROR_CATEGORY: SteamGameCategory = {
        id: -1,
        description: 'Error'
    };

    public static get ERROR_CATEGORY_IDS(): number[] {
        return [SteamAppUtils.ERROR_CATEGORY.id];
    }

    public static getStoreURL(appId: number): string {
        return `https://store.steampowered.com/app/${appId}`;
    }

    public static getCategoryName(categoryId: number): string {
        return (settings.steam.categories as any)[`${categoryId}`];
    }

    public static getErrorGameDetails(appId: number): SteamGameDetails {
        return {
            steam_appid: appId,
            categories: [SteamAppUtils.ERROR_CATEGORY]
        } as SteamGameDetails;
    }

    public static isGameInCategory(game: SteamGameDetails, categoryIds: number[]): boolean {
        const gameCategories = game.categories.map(category => category.id);
        return categoryIds.some(requiredCategory => gameCategories.includes(requiredCategory));
    }
}
