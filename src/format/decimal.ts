var specialChars = {
    '#': 1,
    '0': 1,
    '\'': 1,
    '.': 1,
    ',': 1,
    '+': 1
}

export class Scanner{
    public pattern: string;
    public index: number = 0;
    public getCharacter(){
        return this.pattern[this.index];
    }
    public advance(){
        this.index++;
    }

    public hasMore(){
        return this.index < this.pattern.length;
    }
}

class Pattern{
    prefix: string = "";
    suffix: string = "";
    integer: Integer;
    fraction: Fraction;
}

class Fraction{
    optional: string = "";
    required: string = "";
}

class Integer{
    optional: string = "";
    required: string = "";
}

function parseOptionalInteger(scanner: Scanner): string{
    var r = "";
    while(scanner.getCharacter() === '#' || scanner.getCharacter() === ','){
        r+=scanner.getCharacter();
        scanner.advance();
    }
    return r;
}

function parseRequiredInteger(scanner: Scanner): string{
    var r = "";
    while(scanner.getCharacter() === '0' || scanner.getCharacter() === ','){
        r += scanner.getCharacter();
        scanner.advance();
    }
    return r;
}

function parseInteger(scanner: Scanner): Integer{
    var int = new Integer();
    int.optional = parseOptionalInteger(scanner);
    int.required = parseRequiredInteger(scanner);
    return int;
}

function parseFraction(scanner: Scanner): Fraction{
    var fr = new Fraction();
    fr.required = parseRequiredInteger(scanner);
    fr.optional = parseOptionalInteger(scanner);
    return fr;
}

function parsePattern(scanner: Scanner): Pattern{
    var prefix = parsePrefix(scanner);
    var int = parseInteger(scanner);
    if (scanner.getCharacter() === '.'){
        scanner.advance();
        var fr = parseFraction(scanner);
    }
    else
    {
        fr = new Fraction();
    }
    var suffix = parsePrefix(scanner);
    var pt = new Pattern();
    pt.fraction = fr;
    pt.prefix = prefix;
    pt.suffix = suffix;
    pt.integer = int;
    return pt;
}

function parseQuote(scanner: Scanner): string{
    scanner.advance();
    var res = '';
    while(scanner.getCharacter() !== '\''){
        res += scanner.getCharacter();
        scanner.advance();
    }
    scanner.advance();
    if (res === ''){
        return '\'';
    }
    return res;
}

function parsePrefix(scanner: Scanner): string{
    var char = scanner.getCharacter();
    var res = "";
    while(scanner.hasMore()){
        if (!(char in specialChars)){
            res += char;
            scanner.advance();
        }
        else if (char === '\''){
            res+=parseQuote(scanner);
        }
        else
        {
            break;
        }
    }
    return res;
}


export class IntegerPart{
    public minNr: number = 0;
    public groupingNr: number = Number.MAX_VALUE;
    public groupingSeparator = ",";
    public missingFiller = '0';

    public format(int: string){
        var res = int;
        var toAdd = this.minNr - res.length;
        if (toAdd > 0){
            res = new Array(toAdd+1).join(this.missingFiller) + res;
        }
        var regex = new RegExp('\\B(?=(\\d{'+this.groupingNr+'})+(?!\\d))', "g");
        var withGrouping = res.toString().replace(regex, this.groupingSeparator);
        return withGrouping;
    }
}

function roundUp(nr: string[], indx: number): string[]{
    if (nr[indx] === '9'){
        nr[indx] = '0';
        if (indx === 0){
            nr.splice(0, 0, "1");
            return nr;
        }else {
            return roundUp(nr, indx-1);
        }
    }
    else {
        nr[indx] = String.fromCharCode(nr[indx].charCodeAt(0));
        return nr;
    }
}

export interface IFractionFormat{
    formatted: string;
    overflow: boolean;
}

export class FractionPart{

    public minNr: number = 0;
    public maxNr: number = 2;
    public missingFiller = '0';

    public format(fr: string): IFractionFormat{
        var toAdd = this.minNr - fr.length;
        if (toAdd > 0){
            fr = fr + new Array(toAdd+1).join(this.missingFiller);
        }
        if (fr.length > this.maxNr){
            var lastChar = fr[this.maxNr];
            fr = fr.substr(0, this.maxNr);
            if (lastChar >= '5'){
                if (fr.length > 0){
                    var nr = roundUp(fr.split(""), fr.length - 1).join("");
                }
                else
                {
                    var nr = "1";
                }
                if (nr.length > fr.length){
                    fr = "";
                    toAdd = this.minNr - fr.length;
                    if (toAdd > 0){
                        fr = fr + new Array(toAdd+1).join(this.missingFiller);
                    }
                    return {
                        formatted: fr,
                        overflow: true
                    }
                }
            }
        }
        return {
            formatted: fr,
            overflow: false
        }
    }

}

export class DecimalNumberFormatter{

    public prefix: string;
    public suffix: string;
    public fractionSeparator = ".";
    public integer: IntegerPart;
    public fraction: FractionPart;

    public format(numb: number): string{
        var minus = "";
        if (numb < 0){
            numb = -numb;
            minus = "-";
        }
        var n = numb+"";
        var spl = n.split(".");
        if (spl.length > 1){
            var intPart = spl[0];
            var fractionPart = spl[1];
        }
        else {
            intPart = spl[0];
            fractionPart = "";
        }
        var fraction = this.fraction.format(fractionPart);
        if (fraction.overflow){
            intPart = roundUp(intPart.split(""), intPart.length - 1).join("");
        }
        var int = this.integer.format(intPart);
        if (fraction.formatted.length > 0){
            return minus+this.prefix+int+this.fractionSeparator+fraction.formatted+this.suffix;
        }
        return minus+this.prefix+int+this.suffix;
    }

}

export interface IIntegerPart{
    groupingSeparator?: string;
    minNr?: number;
    groupingNr?: number;
    filler?: string;
}

export interface IFractionPart{
    minNr?: number;
    maxNr?: number;
    filler?: string;
}

export interface IDecimalFormat{
    prefix?: string;
    suffix?: string;
    fractionSeparator?: string;
    integer?: IIntegerPart;
    fraction?: IFractionPart;
}

export function createFormatterFromConfig(config: IDecimalFormat){
    var format = new DecimalNumberFormatter();
    format.prefix = config.prefix || "";
    format.suffix = config.suffix || "";
    if ("fractionSeparator" in config){
        format.fractionSeparator = config.fractionSeparator;
    }
    format.integer = new IntegerPart();
    format.fraction = new FractionPart();
    var int = config.integer;
    if (int){
        if ("filler" in int){
            format.integer.missingFiller = int.filler;
        }
        if ("groupingSeparator" in int){
            format.integer.groupingSeparator = int.groupingSeparator;
        }
        if ("minNr" in int){
            format.integer.minNr = int.minNr;
        }
        if("groupingNr" in int){
            format.integer.groupingNr = int.groupingNr;
        }
    }
    var fract = config.fraction;
    if (fract){
        if ("minNr" in fract){
            format.fraction.minNr = fract.minNr;
        }
        if ("maxNr" in fract){
            format.fraction.maxNr = fract.maxNr;
        }
        if ("filler" in fract){
            format.fraction.missingFiller = fract.filler;
        }
    }
    return format;

}

export default function parse(pattern: string){
    var scanner = new Scanner();
    scanner.pattern = pattern;
    var pat = parsePattern(scanner);
    var formatter = new DecimalNumberFormatter();
    formatter.prefix = pat.prefix;
    formatter.suffix = pat.suffix;
    var fractPart = new FractionPart();
    fractPart.maxNr = pat.fraction.required.length + pat.fraction.optional.length;
    fractPart.minNr = pat.fraction.required.length;
    formatter.fraction = fractPart;
    var intPart = new IntegerPart();
    formatter.integer = intPart;
    intPart.minNr = pat.integer.required.replace(",", "").length;
    var fs = pat.integer.optional + pat.integer.required;
    var indx = fs.lastIndexOf(",");
    if (indx >= 0){
        intPart.groupingNr = fs.length - indx - 1;
    }
    return formatter;
}

