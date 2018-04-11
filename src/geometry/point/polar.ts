export interface IPolarPoint{
    angle: number,
    radius: number
}

export default function polar(angle: number, radius: number): IPolarPoint{
    return {
        angle: angle,
        radius: radius
    }
}
