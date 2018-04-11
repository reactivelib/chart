import {EasingType, IEaser} from "./func";

export interface IEasingSettings{

    duration?: number;
    delay?: number;
    easing?: IEaser | EasingType;

}

export interface IValueSettings<E>{
    value: E;
    end: E;
    set(e: E): void;
    onFinished?(): void;
}
