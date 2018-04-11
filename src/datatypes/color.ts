/**
 * @editor
 */
export interface IColorable{
    /**
     * Color of the point. Shapes will use the configured @api{chart.cartesian.IXYChartSettings.colorScales} and this value
     * to determine the color of the shape.
     */
    c?: string | number;
}
