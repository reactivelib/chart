export interface IUnifiedEvent{

    original: UIEvent;
    clientX: number;
    clientY: number;
    preventDefault();
    stopPropagation();

}

export interface IUnifiedEvents{

    up?: (ev: IUnifiedEvent) => void;
    down?: (ev: IUnifiedEvent) => void;
    move?: (ev: IUnifiedEvent) => void;
    enter?: (ev: IUnifiedEvent) => void;
    leave?: (ev: IUnifiedEvent) => void;
    over?: (ev: IUnifiedEvent) => void;
    out?: (ev: IUnifiedEvent) => void;
    click?: (ev: IUnifiedEvent) => void;

}

function mouseToUnified(ev: MouseEvent): IUnifiedEvent{
    return {
        clientX: ev.clientX,
        clientY: ev.clientY,
        original: ev,
        preventDefault: () => {
            ev.preventDefault();
        },
        stopPropagation: () => {
            ev.stopPropagation();
        }
    }
}

function touchToUnified(ev: TouchEvent): IUnifiedEvent{
    var touch = ev.touches[0];
    if (!touch){
        var cx = 0;
        var cy = 0;
    }
    else{
        cx = touch.clientX;
        cy = touch.clientY;
    }
    return {
        clientX: cx,
        clientY: cy,
        original: ev,
        preventDefault: () => {
            ev.preventDefault();
        },
        stopPropagation: () => {
            ev.stopPropagation();
        }
    }
}

export default function(events: IUnifiedEvents){
    var touching = false;
    var over = false;
    var ignore = false;
    return {
        touchstart: (ev: TouchEvent) => {
            ignore = true;
            if (!touching){
                touching = true;
                if (!over){
                    events.enter && events.enter(touchToUnified(ev));
                    events.over && events.over(touchToUnified(ev));
                }
                var l1 = () => {
                    ignore = false;
                }
                var l2 = (ev: TouchEvent) => {
                    if (!ignore){
                        events.out && events.out(touchToUnified(ev));
                        events.leave && events.leave(touchToUnified(ev));
                        window.removeEventListener("touchstart", l1, true);
                        window.removeEventListener("touchstart", l2, false);
                        touching = false;
                    }
                }
                window.addEventListener("touchstart", l1, true);
                window.addEventListener("touchstart", l2, false)
            }
            events.move && events.move(touchToUnified(ev));
            events.down && events.down(touchToUnified(ev));

        },
        touchmove: (ev: TouchEvent) => {
            if (touching){
                events.move && events.move(touchToUnified(ev));
            }
        },
        touchcancel: (ev: TouchEvent) => {
            if (touching){
                events.up && events.up(touchToUnified(ev));
            }
        },
        touchend: (ev: TouchEvent) => {
            if (touching){
                events.up && events.up(touchToUnified(ev));
            }
        },
        mouseup: (ev: MouseEvent) => {
            if (!touching){
                events.up && events.up(mouseToUnified(ev));
            }
        },
        mouseleave: (ev: MouseEvent) => {
            events.leave && events.leave(mouseToUnified(ev));
        },
        mousemove: (ev: MouseEvent) => {
            if (!touching){
                events.move && events.move(mouseToUnified(ev));
            }
        },
        mousedown: (ev: MouseEvent) => {
            if (!touching){
                events.down && events.down(mouseToUnified(ev));
            }
        },
        mouseenter: (ev: MouseEvent) => {
            events.enter && events.enter(mouseToUnified(ev));
        },
        mouseout: (ev: MouseEvent) => {
            if (!touching){
                events.out && events.out(mouseToUnified(ev));
                over = false;
            }
        },
        click: (ev: MouseEvent) => {
            if (!touching){
                events.click && events.click(mouseToUnified(ev));
            }
        }
    }
}

export class UnifiedEventBroadcaster implements IUnifiedEvents{

    public events: IUnifiedEvents[] = [];

    public add(event: IUnifiedEvents){
        this.events.push(event);
    }

    public remove(event: IUnifiedEvents){
        this.events.splice(this.events.indexOf(event), 1);
    }


    up(ev: IUnifiedEvent){
       this.events.forEach(e => e.up && e.up(ev));
    }

    down(ev: IUnifiedEvent){
        this.events.forEach(e => e.down && e.down(ev));
    }

    move(ev: IUnifiedEvent){
        this.events.forEach(e => e.move && e.move(ev));
    }

    enter(ev: IUnifiedEvent){
        this.events.forEach(e => e.enter && e.enter(ev));
    }

    leave(ev: IUnifiedEvent){
        this.events.forEach(e => e.leave && e.leave(ev));
    }

    over(ev: IUnifiedEvent){
        this.events.forEach(e => e.over && e.over(ev));
    }

    out(ev: IUnifiedEvent){
        this.events.forEach(e => e.out && e.out(ev));
    }

    click(ev: IUnifiedEvent){
        this.events.forEach(e => e.click && e.click(ev));
    }


}

export function unifiedEventsBroadcaster(){
    return new UnifiedEventBroadcaster();
}