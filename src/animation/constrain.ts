import {animateValueGroup, IEasingAnimation} from "./engine";
import {IEasingSettings, IValueSettings} from "./ease/index";

export class SingleAnimationEasing{

    public last: IEasingAnimation;

    public next(anim: IEasingAnimation){
        if (this.last){
            this.last.finished = true;
        }
        this.last = anim;
    }
    
    public cancel(){
        if (this.last){
            this.last.finished = true;
            this.last = null;
        }
    }


}

export interface ISingleGroupAnimationEasingOptions{
    onFinished?: () => void;
}

export class SingleGroupAnimationEasing extends SingleAnimationEasing{

    public easingSettings: IEasingSettings;
    
    public ease(grp: IValueSettings<any>[], options: ISingleGroupAnimationEasingOptions = {}){
        var es = this.easingSettings;
        this.next(animateValueGroup({
            delay: es.delay,
            easing: es.easing,
            duration: es.duration,
            values: grp,
            onFinished: options.onFinished ? function(){
                options.onFinished();
            } : null
        }));
    }

}

SingleGroupAnimationEasing.prototype.easingSettings = {};