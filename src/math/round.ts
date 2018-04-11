/**
 *
 * @api
 * Rounds a number
 */
export interface IFixedPartRounder{
    /**
     *
     * @param n the rounded number
     */
    (n: number): number;
    fixedPart: number;
}

export default function rounder(fixedPart: number): IFixedPartRounder{
    var fpr = <IFixedPartRounder> function roundByFixedPart(value: number) {
        var part = fixedPart;
        return Math.round(value / part) * part;
    };
    fpr.fixedPart = fixedPart;
    return fpr;
}