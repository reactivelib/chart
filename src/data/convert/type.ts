export interface ITypeConverterSettings<E>{
    typeToConverter: {[s: string]: (text: string) => E[]};
}

export interface IToConvert<E>{
    type: string;
    text: string;
}

export default function<E>(settings: ITypeConverterSettings<E>){
    return function(toConvert: IToConvert<E>){
        settings.typeToConverter[toConvert.type](toConvert.text);
    }
}