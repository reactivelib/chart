import {
    FlexibleChildGroupRenderer,
    RenderOnlyConstantGroup,
    ICanvasGroup
} from "../../../../../../../render/canvas/shape/group/index";
import {HashMap} from "../../../../../../../../collection/hash";
import {ICanvasChildShape} from "../../../../../../../render/canvas/shape/index";
import {IXYSeriesSystem} from "../../../../../series";
import {IPoint} from "../../../../../../../../geometry/point/index";
import {CanvasContext} from "../../../../../../../render/canvas/context/index";
import {IFindInfo} from "../../../../../../../render/canvas/find/index";
import {IIterator} from "../../../../../../../../collection/iterator/index";
import {arrayIterator} from "../../../../../../../../collection/iterator/array";

export interface IHighlightedDataGroup extends ICanvasChildShape {

    getChildren(): IIterator<ICanvasChildShape>;

    highlight(index: number[]): void;

}

export class DataHighlightGroupCollection extends RenderOnlyConstantGroup implements IHighlightedDataGroup {

    constructor(public groups: IHighlightedDataGroup[]) {
        super({iterator: () => arrayIterator(groups)});
    }

    public highlight(index: number[]) {
        this.groups.forEach(g => g.highlight(index));
    }

}

export class CartesianSeriesHighlightedDataGroup extends FlexibleChildGroupRenderer implements IHighlightedDataGroup {

    private lastHighlighted = new HashMap<any, { child: ICanvasChildShape, data: any }>();

    constructor(public series: IXYSeriesSystem, public getHighlightForIndex: (indx: number) => ICanvasChildShape) {
        super();
    }

    highlight(index: number[]) {
        var newHighlighted = new HashMap<any, any>();
        var olds:any = {};
        for (var i = 0; i < index.length; i++) {
            var ix = index[i];
            if (ix in olds){
                continue;
            }
            olds[ix] = ix;
            var indx = this.series.shapeDataProvider.dataToShapeIndex(index[i]);
            var data = this.series.shapeData.get(indx);
            if (data) {
                var child = this.lastHighlighted.get(data.data);
                if (!child) {
                    var c = this.getHighlightForIndex(indx);
                    if (c) {
                        this.addChild(c);
                        child = {child: c, data: data.data}
                    }
                }
                if (child) {
                    newHighlighted.put(data.data, child);
                }
            }
        }
        for (var k in this.lastHighlighted.objects) {
            if (!(k in newHighlighted.objects)) {
                child = this.lastHighlighted.objects[k].value;
                this.removeChild(child.child);
            }
        }
        this.lastHighlighted = newHighlighted;
    }

    public find(pt: IPoint, ctx: CanvasContext): IFindInfo[] {
        return null;
    }

}