export interface IIdentificationProviderSettings{
    prefix?: string;
}

/**
 * An object with an id
 */
export interface IIdentifiable{
    /**
     * The id of this object
     */
    id: string;
}

export type IIdentifiableSettings = Partial<IIdentifiable>;

export function createIdentificationProvider(settings: IIdentificationProviderSettings = {}){
    var prefix = settings.prefix || "";
    var ids = 0;
    return function(settings: IIdentifiableSettings = {}){
        if ("id" in settings){
            return settings.id;
        }
        ids++;
        return prefix+ids;
    }
}