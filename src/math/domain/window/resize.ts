/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICancellable, procedure, unobserved, variable} from "@reactivelib/reactive";
import {IPointInterval} from "../../../geometry/interval/index";
import animateObject, {IObjectEasingResult} from '../../../animation/object';

export interface IWindowResizer{

}

export function createDiffForStartValue(start: number, end: number){
    return start - end;
}

export function createDiffForEndValue(start: number, end: number){
    return end - start;
}

class ValuePredictor{
    
    public endValue: number;
    private r_isAttached = variable(false);
    
    get isAttached(){
        return this.r_isAttached.value;
    }
    
    set isAttached(v: boolean){
        this.r_isAttached.value = v;
    }
    
    constructor(){
        
    }
    
}

class ValueResizer{    

    public r_following = variable<boolean>(true);
    public useAnimations = true;
    public resizing = false;
    public lastAnim: IObjectEasingResult;    
    public toResize: number = null;
    public r_blocked = variable<boolean>(false);
    public first = true;
    get blocked(){
        return this.r_blocked.value;
    }
    set blocked(v){
        this.r_blocked.value = v;
    }
    public duration = 300;

    get following(){
        return this.r_following.value;
    }

    set following(v){
        if (v){
            this.toResize = null;
        }
        this.r_following.value = v;
    }

    private doResize(to: number){
        this.toResize = to;
        if (this.useAnimations && !this.first){            
            this.resizing = true;
            this.lastAnim = animateObject({
                duration: this.duration,
                from: this.follower,
                to: {
                    value: to
                },
                onFinished: () => {
                    this.resizing = false;
                    this.lastAnim = null;
                }
            });
        }else{
            this.first = false;
            unobserved(() => {
                this.follower.value = to;                
            });
            this.resizing = false;
        }     
    }

    private proc: procedure.IProcedure;

    constructor(public follow: variable.IVariable<number>, public follower: variable.IVariable<number>){

    }

    public start(){
        if (this.proc){
            return;
        }
        var follow = this.follow;
        var follower = this.follower;
        this.proc = procedure(() => {          
            if (this.blocked){
                if (this.lastAnim){
                    this.lastAnim.cancel();
                    this.resizing = false;
                }
                return;
            }              
            var wer = follower.value;
            var fol = follow.value;
            if (this.following){
                if (this.resizing){
                    if (fol !== this.toResize){
                        this.lastAnim.cancel();
                        this.doResize(fol);
                    }
                }
                else{
                    if (fol !== wer){
                        if (fol !== this.toResize){
                            this.doResize(fol);
                        }                      
                        else{
                            unobserved(() => {
                                this.following = false;
                            });         
                        }  
                    }    
                }
            }
            else{
                if (this.resizing){
                    this.lastAnim.cancel();
                    this.resizing = false;                                        
                }
                fol = follow.value;
                wer = follower.value;
                if (fol === wer){
                    unobserved(() => {
                        this.following = true;
                    });
                    this.toResize = fol; 
                }
            }
        });
    }

    public cancel(){
        this.proc && this.proc.cancel();
        this.proc = null;
    }
}

export class WindowResizer implements IWindowResizer, ICancellable{
    
    public startResize: ValueResizer;
    public endResize: ValueResizer;

    set blocked(v: boolean){
        this.startResize.blocked = v;
        this.endResize.blocked = v;
    }
    
    
    public attachEnd(){
        this.endResize.following = true;
    }

    public detachStart(){
        this.startResize.following = false;
    }

    public detachEnd(){
        this.endResize.following = false;
    }
    
    public attachStart(){
        this.startResize.following = true;
    }
    
    public isStartAttached(){
        return this.startResize.following;
    }
    
    public isEndAttached(){
        return this.endResize.following;
    }

    public cancel(){
        this.startResize.cancel();
        this.endResize.cancel();
    }

    constructor(public window: () => IPointInterval, public domain: IPointInterval){
        var domain = this.domain;
        var window = this.window;
        this.startResize = new ValueResizer({
            get value(){
                return domain.start;
            },
            set value(v){
                domain.start = v;
            }
        },{
            get value(){
                return window().start;
            },
            set value(v){
                window().start = v;
            }
        });
        this.endResize = new ValueResizer({
            get value(){
                return domain.end;
            },
            set value(v){
                domain.end = v;
            }
        },{
            get value(){
                return window().end;
            },
            set value(v){
                window().end = v;
            }
        });
    }

    public start(){        
        this.startResize.start();
        this.endResize.start();
    }

}