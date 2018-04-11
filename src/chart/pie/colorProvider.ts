/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import unique from '../../color/generator';
import { IGlobalChartSettings } from '../style';
import {deps} from "../../config/di";

export default deps(function(theme: IGlobalChartSettings){
    return () => {
        var uq = unique(theme.series.colors);
        return () => {
            return uq.next();
        }
    }
}, ["theme"])