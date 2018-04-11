export type IXYChartInteractionModes = "none" | "movezoom" | "select" | "move" | "zoom";

/**
 * Configures how the user can interact with the chart
 * 
 */
export interface IXYChartInteractionSettings{
    /**
     * The interaction mode of the chart. Following modi are awailable:
     * |mode|description|
     * |---|---|
     * |"none"|No interaction with the chart|
     * |"zoom-move"|For charts of type "x" only. User can zoom in by dragging chart up/down and move by dragging left/right|
     * |"select"|User can select a region were to zoom in|
     * |"move"|User can move the chart window by dragging it with the mouse|
     * |"zoom"|For charts of type "x" only. User can zoom in by dragging chart up/down|
     */
    mode?: IXYChartInteractionModes;

    /**
     * The available modes
     */
    modes?: IXYChartInteractionModes[];

    /**
     * If true, constraints movement inside the maximally visible domain. 
     * If false, there are no limits when changing the window.
     */
    constrain?: boolean;
}