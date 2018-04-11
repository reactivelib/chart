/**
 * The color space
 */
export type SPACE = "rgb" | "hsa";

/**
 * Represents a color
 */
export interface IColor{
    /**
     * The color space
     */
    space: SPACE;
    /**
     * Does it have an alpha channel
     */
    hasAlpha: boolean;
    /**
     * The alpha channel
     */
    a: number;

    /**
     * Converts the given color in any color space into the same color that has this color space
     * @param {IColor} color
     * @returns {IColor}
     */
    convert(color: IColor): IColor;

    /**
     *
     * @returns {Rgba} This color in rgba color space
     */
    toRGB(): Rgba;

    /**
     *
     * @returns {Hsla} This color in hsla color space
     */
    toHSL(): Hsla;
}

/**
 * Represents a color in RGBA color space
 */
export class Rgba implements IColor {

    public a = 1;
    /**
     * Red, between 0 and 256
     */
    public r: number;
    /**
     * Green, between 0 and 256
     *
     */
    public g: number;
    /**
     * Blue, between 0 and 256
     *
     */
    public b: number;
    public hasAlpha = false;
    /**
     * If true, will use percentages to output the rbg value
     * @type {boolean}
     */
    public hasPercent = false;
    /**
     * If true, will output this color as HEX value.
     * @type {boolean}
     */
    public isHex = false;
    public space: SPACE = "rgb";

    /**
     *
     * @param {number} r red
     * @param {number} g green
     * @param {number} b blue
     */
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public toRGB(): Rgba{
        var rgb = new Rgba(this.r, this.g, this.b);
        rgb.a = this.a;
        rgb.hasAlpha = this.hasAlpha;
        this.hasPercent = this.hasPercent;
        this.isHex = this.isHex;
        return rgb;
    }

    public toHSL(): Hsla{
        var hsl = new Hsla(0,100,100);
        hsl.a = this.a;
        return hsl.convert(this);
    }

    public toString() {
        if (this.isHex) {
            return this.toHex();
        }
        return this.toRgb();
    }

    public toHex() {
        return "#" + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1);
    }

    public toRgb() {
        var alpha = this.hasAlpha ? ", " + this.a : "";
        var a = this.hasAlpha ? "a" : "";
        return "rgb"+a+"(" + this.valToString(this.r) + ", " + this.valToString(this.g) + ", " + this.valToString(this.b) + alpha + ")";
    }

    public valToString(val: number) {
        return this.hasPercent ? Math.round(val / 255 * 100) + "%" : Math.round(val);
    }
    
    public convert(color: IColor) {
        if (color.space === "rgb") {
            var rgb: Rgba = new Rgba((<Rgba>color).r, (<Rgba>color).g, (<Rgba>color).b);
            rgb.a = color.a;
            rgb.isHex = this.isHex;
            rgb.hasAlpha = this.hasAlpha;
            rgb.hasPercent = this.hasPercent;
            return rgb;
        }
        else {
            var h = (<Hsla>color).h / 360;
            var s = (<Hsla>color).s / 100;
            var l = (<Hsla>color).l / 100;
            var r, g, b;
            if (s == 0) {
                r = l;
                g = l;
                b = l;
            } else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            var rgba: Rgba = new Rgba(r * 255, g * 255, b * 255);
            rgba.hasAlpha = this.hasAlpha;
            rgba.isHex = this.isHex;
            rgba.hasPercent = this.hasPercent;
            rgba.a = this.a;
            return rgba;
        }
    }
}

/**
 * Represents a color in HSLA space
 */
export class Hsla implements IColor{

    /**
     *
     * @param {number} h The hue
     * @param {number} s The saturation
     * @param {number} l The lightness
     */
    constructor(public h: number, public s: number, public l: number){

    }

    public space:SPACE = "hsa";
    public a = 1;

    get hasAlpha(){
        return this.a !== 1;
    }

    public toString(){
        var alpha = this.hasAlpha ? ", "+this.a : "";
        var hsl = this.hasAlpha ? "hsla" : "hsl";
        return hsl+"("+Math.round(this.h)+", "+Math.round(this.s)+"%, "+Math.round(this.l)+"%"+alpha+")";
    }

    public toRGB(): Rgba{
        var rgb = new Rgba(1,1,1);
        rgb.a = this.a;
        rgb.hasAlpha = this.hasAlpha;
        return rgb.convert(this);
    }

    public toHSL(){
        var hsl = new Hsla(this.h, this.s, this.l);
        hsl.a = this.a;
        return hsl;
    }

    public convert(color: IColor): Hsla{
        if (color.space === "hsa"){
            var c = <Hsla> color;
            return c;
        }
        else {
            var crgb = <Rgba> color;
            var r = crgb.r / 255;
            var g = crgb.g / 255;
            var b = crgb.b / 255;
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if(max == min){
                h = s = 0;
            }else{
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h *= 60;
            }
            var hsl = new Hsla(h, Math.round(s*100), Math.round(l*100));
            hsl.a = this.a;
            return hsl;
        }
    }
}

function hue2rgb(p: number, q: number, t: number){
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

export function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
        "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
        "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
        "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
        "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
        "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
        "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
        "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
        "honeydew":"#f0fff0","hotpink":"#ff69b4",
        "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
        "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
        "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
        "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
        "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
        "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
        "navajowhite":"#ffdead","navy":"#000080",
        "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
        "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
        "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
        "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
        "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
        "violet":"#ee82ee",
        "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
        "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}

function parseString(s: string): IColor{
    s = s.trim();
    var hex = colourNameToHex(s);
    if (hex){
        return parseString(hex);
    }
    if (s[0] === "#"){
        return parseHex(s);
    }
    else if (s[0] === "r"){
        return parseRgba(s);
    }
    else if (s[0] === "h"){
        return parseHsla(s);
    }
    else {
        throw new Error("color unknown");
    }
}

function parseHex(hex: string) {
    var sr = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(sr, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (res)
    {
        var rgb = new Rgba(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16))
        rgb.isHex = true;
        return rgb;
    }
    throw new Error("illegal hex color");
}

function parseRgba(rgba: string){
    var matches = rgba.match(/[-+]?(\d*[.])?\d+%?/g);
    var rgb = new Rgba(parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2]));
    if (matches[0][matches[0].length-1] === '%'){
        rgb.hasPercent = true;
        rgb.r = (rgb.r / 100) * 255;
        rgb.g = (rgb.g / 100) * 255;
        rgb.b = (rgb.b / 100) * 255;
    }
    if (matches.length > 3){
        rgb.hasAlpha = true;
        rgb.a = parseFloat(matches[3]);
    }
    return rgb;
}

function parseHsla(s: string){
    var matches = s.match(/[-+]?(\d*[.])?\d+%?/g);
    if ((matches.length !== 3 ) && (matches.length !== 4)){
        throw new Error("Illegal hsa color");
    }
    var hsla = new Hsla(parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2]));
    if (matches.length > 3){
        hsla.a = parseFloat(matches[3]);
    }
    return hsla;
}

/**
 * Parses a given color in string representation.
 * @param {string | IColor} str a string representing the color
 * @returns {IColor} The parsed color from the given string
 */
export function color(str: string | IColor): IColor{
    if (typeof str === "string"){
        return parseString(str);
    }
    else {
        return str;
    }
}

export default color;

export function rgb(r: number, g: number, b: number){
    return new Rgba(r, g, b);
}

export function hsl(h: number, s: number, l: number){
    return new Hsla(h, s, l);
}