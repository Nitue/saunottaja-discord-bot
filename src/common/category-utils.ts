import settings from "../settings.json";

export default class CategoryUtils {
    public static getCategoryIds(category: string | null): number[] {
        return category != null && !!(settings.categories as any)[category]
            ? (settings.categories as any)[category].categoryIds
            : settings.categories.default.categoryIds;
    }
}