import {list, requestAnimation} from "@reactivelib/core";
import {transaction} from "@reactivelib/reactive";
import {createEaser, IValueEasingSettings} from "./ease/value";
import {createGroupEaser, IGroupEaserSettings} from "./ease/group";

class Engine {

    public animations = list<IEasingAnimator>();

    public setTime(newTime:number) {
        var el = this.animations.first;
        var last = this.animations.last;
        while ((el = el.next) !== last) {
            var an: IEasingAnimator = el.value;
            if (an.finished) {
                el.remove();
                continue;
            }
            try {
                an.setTime(newTime);
                if (an.finished) {
                    el.remove();
                }
            } catch (err) {
                an.finished = true;
                el.remove();
            }
        }
    }

    public hasMore() {
        return this.animations.size > 0;
    }

    public addAnimation(animation: IEasingAnimator) {
        return this.animations.addLast(animation);
    }

}

class Runner {

    public engine = new Engine();
    public animating = false;

    public add(easing:IEasingAnimator) {
        this.engine.addAnimation(easing);
    }

    public run() {
        this.animating = false;
        var self = this;
        transaction(function () {
            self.engine.setTime(Date.now());
        });
        this.startAnimating();
    }

    public startAnimating() {
        if (!this.animating && this.engine.hasMore()) {
            var self = this;
            requestAnimation(function () {
                self.run();
            });
            this.animating = true;
        }
    }
}

var runner = new Runner();

export interface IEasingAnimation{
    finished: boolean;
}

export interface IEasingAnimator extends IEasingAnimation{
    setTime(time: number): void;
}

export function animateValue<E>(settings: IValueEasingSettings<any>): IEasingAnimation{
    var ease = createEaser<E>(settings);
    runner.add(ease);
    runner.startAnimating();
    return ease;
}

export function animateValueGroup(settings: IGroupEaserSettings): IEasingAnimation{
    var ease = createGroupEaser(settings);
    runner.add(ease);
    runner.startAnimating();
    return ease;
}