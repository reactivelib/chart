import {IPointWithRadius} from "../index";

export default function(pt: IPointWithRadius, scale: number){
    pt.radius = scale * pt.radius;
    return pt;
}