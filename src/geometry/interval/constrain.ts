import {IValueConstraintsSettings, normalizeValueModifySettings} from "../value/constrain";

export interface IIntervalConstraints{

    start?: IValueConstraintsSettings;
    end?: IValueConstraintsSettings;
    size?: IValueConstraintsSettings;

}

export function normalizeIntervalConstraints(settings: IIntervalConstraints = {}){
    return {
        start: normalizeValueModifySettings(settings.start),
        end: normalizeValueModifySettings(settings.end),
        size: normalizeValueModifySettings(settings.size)
    }
}