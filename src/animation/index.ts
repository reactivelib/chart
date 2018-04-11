import animateObject, {IObjectEasing, IObjectEasingResult} from "./object";

export function animate(settings: IObjectEasing): IObjectEasingResult{
    return animateObject(settings);
}

declare var module: any;

module.exports = animate;