export interface IBorderLineStyle{
    color?: string;
    style?: string;
    width?: string;
}

export interface IBorderStyle extends IBorderLineStyle{
    left?: IBorderLineStyle;
    right?: IBorderLineStyle;
    bottom?: IBorderLineStyle;
    top?: IBorderLineStyle;
    radius?: string;
}

const lineProps = {color: true, style: true, width: true}
const borderProps = {color: true, style: true, width: true, radius: true};
const sideProps = {left: true, top: true, right: true, bottom: true};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function borderLineStyleToCSS(prefix: string, style: IBorderLineStyle, res: any){
    for (var s in style){
        if (s in lineProps){
            res["border"+capitalizeFirstLetter(prefix)+capitalizeFirstLetter(s)] = style[s];
        }
    }
}

export function borderStyleToCSS(style: IBorderLineStyle){
    var res: any = {};
    for (var s in style){
        if (s in borderProps){
            res["border"+capitalizeFirstLetter(s)] = style[s];
        }
        else if (s in sideProps){
            borderLineStyleToCSS(s, sideProps[s], res);
        }
    }
    return res;
}