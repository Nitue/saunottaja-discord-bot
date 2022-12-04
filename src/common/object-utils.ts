
export default class ObjectUtils {
    public static isEmptyObject(obj: any) {
        return Object.keys(obj).length === 0;
    }
}