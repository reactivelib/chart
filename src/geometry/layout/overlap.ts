/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

// import {RTree} from "../../collection/rtree";
// import {IRectangle, IPointRectangle} from "../rectangle/index";
// import {IIterable} from "../../collection/iterator/index";
//
//
// export class OverlapTree extends RTree{
//
//     public isOverlapping(r1: IPointRectangle, r2: IPointRectangle){
//         var xs1 = r1.x;
//         var xe1 = xs1 + r1.width;
//         var xs2 = r2.x;
//         var xe2 = r2.x + r2.width
//
//         var ys1 = r1.y;
//         var ye1 = ys1 + r1.height;
//         var ys2 = r2.y;
//         var ye2 = r2.y + r2.height;
//         return (xs1 < xe2 && xe1 > xs2) && (ys1 < ye2 && ye1 > ys2);
//     }
//
// }
//
// export class NoOverlap
// {
//
//     public pos = 0;
//
//     constructor(public rectangles: IIterable<IPointRectangle>){
//
//     }
//
//     public position(pos: number){
//         this.pos = pos;
//         return this;
//     }
//
//     public topToBottom(){
//         var qt = new OverlapTree();
//         var it = this.rectangles.iterator();
//         while (it.hasNext())
//         {
//             var r = it.next();
//             var p = this.pos;
//             r.ys = p;
//             var overlaps = qt.findOverlapping(r);
//             while(overlaps.length > 0)
//             {
//                 for (var j=0; j < overlaps.length; j++)
//                 {
//                     var o = overlaps[j];
//                     p = Math.max(p, o.y + o.height);
//                 }
//                 r.ys = p;
//                 overlaps = qt.findOverlapping(r);
//             }
//             qt.insert(r);
//         }
//     }
//
//     public bottomToTop(){
//         var qt = new OverlapTree();
//         var it = this.rectangles.iterator();
//         while (it.hasNext())
//         {
//             var r = it.next();
//             var p = this.pos;
//             r.y = p;
//             var overlaps = qt.findOverlapping(r);
//             while(overlaps.length > 0)
//             {
//                 for (var j=0; j < overlaps.length; j++)
//                 {
//                     var o = overlaps[j];
//                     p = Math.min(p, o.y);
//                 }
//                 r.y = p - r.height;
//                 overlaps = qt.findOverlapping(r);
//             }
//             qt.insert(r);
//         }
//     }
//
//     public leftToRight(){
//         var qt = new OverlapTree();
//         var it = this.rectangles.iterator();
//         while (it.hasNext())
//         {
//             var r = it.next();
//             var p = this.pos;
//             r.x = p;
//             var overlaps = qt.findOverlapping(r);
//             while(overlaps.length > 0)
//             {
//                 for (var j=0; j < overlaps.length; j++)
//                 {
//                     var o = overlaps[j];
//                     p = Math.max(p, o.x + o.width);
//                 }
//                 r.x = p;
//                 overlaps = qt.findOverlapping(r);
//             }
//             qt.insert(r);
//         }
//     }
//
//     public rightToLeft(){
//         var qt = new OverlapTree();
//         var it = this.rectangles.iterator();
//         while (it.hasNext())
//         {
//             var r = it.next();
//             var p = this.pos;
//             r.x = p;
//             var overlaps = qt.findOverlapping(r);
//             while(overlaps.length > 0)
//             {
//                 for (var j=0; j < overlaps.length; j++)
//                 {
//                     var o = overlaps[j];
//                     p = Math.min(p, o.x);
//                 }
//                 r.x = p - r.width;
//                 overlaps = qt.findOverlapping(r);
//             }
//             qt.insert(r);
//         }
//     }
//
// }
//
// export default function(rectangles: IIterable<IRectangle>){
//     return new NoOverlap(rectangles);
// }