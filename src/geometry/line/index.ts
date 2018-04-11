import {IPoint} from "../point";

/**
 * Represents a line
 */
export interface ILine{
    /**
     * The start position of the line
     */
    start: IPoint;
    /**
     * The end position of the line
     */
    end: IPoint;
}