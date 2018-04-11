import {IPointWithRadius} from "../index";

export default function makePointCrisp(r: IPointWithRadius, round: (n: number) => number){
    r.x = round(r.x);
    r.y = round(r.y);
    if (r.radius >= 1){
        r.radius = round(r.radius);
    }
    return r;
}