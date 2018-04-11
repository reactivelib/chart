import {IDimensionSettings} from "../basic";

export function parseDimensionSettings(dim: number | "auto" | IDimensionSettings = "auto"): IDimensionSettings{
    var tp = typeof dim;
    if (tp === "number"){
        return {
            min: -Number.MAX_VALUE,
            max: Number.MAX_VALUE,
            value: <number>dim
        }
    }
    else if (tp === "string" || dim === void 0){
        return {
            min: -Number.MAX_VALUE,
            max: Number.MAX_VALUE,
            value: "auto"
        }
    }
    else{
        var d = <IDimensionSettings>dim;
        return {
            value: d.value || "auto",
            min: "min" in d ? d.min : -Number.MAX_VALUE,
            max: "max" in d ? d.max : Number.MAX_VALUE
        }
    }
}