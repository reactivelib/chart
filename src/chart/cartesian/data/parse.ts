/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianChartSettings} from '../index';
import {procedure, variable} from '@reactivelib/reactive';
import {CSVDataReader, TableRow} from '../../../data/csv/read';
import {hasHeader} from '../../../data/csv/header';
import {ICartesianXPoint} from '../../../datatypes/value';
import ajax from '../../../ajax/index';
import {CoreChart} from '../../core/basic';
import {AxisCollection} from '../axis/collection/index';
import {AxisTypes} from "../axis/index";
import {IChartAxisSettings} from "../axis/collection/factory";

export interface ICartesianChartDataSettings{

    content: string;
    type?: "text" | "link";
    header?: boolean;
    category?: "number" | "string";
    dateFormat?: string;

}

export interface ISeriesTableEntry{
    id?: string;
    data?: ICartesianXPoint[];
}

export interface ITableResults{

    series: ISeriesTableEntry[];
    categories?: string[];

}

function nullCategoryParser(row: TableRow, categories: any[]){
    row.next();
}

function constantCategoryParser(row: TableRow, categories: any[]){
    var n = row.next();
    categories.push(n);    
}

function categoryParser(settings: ICartesianChartDataSettings, data: string[][], isHeader: boolean){
    var cat = settings.category;
    if (!("category" in settings)){
        cat = "string";
        var dataIndx = 0;
        if (isHeader){
            dataIndx = 1;
        }
        var dat = data[dataIndx];
        if (Array.isArray(dat)){
            var d = dat[0];
            if (d){
                if (/^\s*\d+\s*$/.test(d)){
                    cat = "number";                
                }
            }
        }
    }
    switch(cat){
        /*case "number":
        return function(row: TableRow, categories: any[]){
            categories.push(parseFloat(row.next()));
        }*/
        default:
        return function(row: TableRow, categories: any[]){
            categories.push(row.next());
        }
    }
}

export function readTable(text: string, settings: ICartesianChartDataSettings, axisType: AxisTypes): ITableResults{
    var reader = new CSVDataReader(text);
    if (!reader.hasNext()){
        return null;
    }
    var seriesTable = [];
    var isDiscrete = axisType === "discrete";
    var isHeader = !("header" in settings) ? hasHeader(reader.datas, 1) : settings.header;
    if (!isDiscrete){
        catParser = nullCategoryParser;
    }
    else{
        var catParser = categoryParser(settings, reader.datas, isHeader);
    }    
    if (isHeader){
        var header = reader.next();
        if (header.data.length < 1){
            return null;
        }
        header.next();
        var i = 1;
        while(header.hasNext()){
            var n = header.next();
            seriesTable[i] = {
                id: n,
                data: <ICartesianXPoint[]>[]
            }
            i++;
        }
    }
    var index = 0;
    var categories: any[] = [];
    while(reader.hasNext()){
        var lines = reader.next();
        var parsed = null;
        var i = 0;
        catParser(lines, categories);
        while(lines.hasNext()){            
            i++;
            var cell = lines.next();
            var st: ISeriesTableEntry = seriesTable[i];
            if (!st){
                st = {
                    data: <ICartesianXPoint[]>[]
                };
                seriesTable[i] = st;
            }
            var val = parseFloat(cell);
            if (isDiscrete){
                var point = {
                    x: index,
                    y: val
                }                
            }
            else{
                if (parsed === null){
                    parsed = parseFloat(lines.data[0])
                }
                point = {
                    x: parsed,
                    y: val
                }
            }
            if (!isNaN(point.x) && !isNaN(point.y)){
                st.data.push(point);
            }

        }
        index++;
    }
    seriesTable = seriesTable.filter(st => st.data.length > 0);
    return {
        categories: categories.length > 0 ? categories : null,
        series: seriesTable
    };
}

export function loadFromLink(res: variable.IVariable<ITableResults>, url: string, settings: ICartesianChartDataSettings, xAxes: IChartAxisSettings){
    return ajax({
        url: url,
        result: (resp) => {
            var response = resp.responseText;
            var table = readTable(response, settings, xAxes && xAxes.type || null);
            if (table){
                res.value = table;
            }
        }
    });
}

/**
 *
 * @param {ICartesianChartSettings} settings
 * @param {CoreChart} chart
 * @param {AxisCollection} xAxes
 * @returns {Variable<ITableResults>}
 */
export default function(settings: ICartesianChartSettings, chart: CoreChart){
    var res = variable<ITableResults>(null);
    var lastAjax: XMLHttpRequest = null;
    var proc = procedure(p => {
        if (lastAjax){
            lastAjax.abort();
            lastAjax = null;
        }
        var xa = settings.xAxis || {};
        if (settings.data){
            var dataS = settings.data;
            if (typeof dataS === "string"){
                dataS = {
                    content: dataS
                }
            }
            var dt = dataS.type;
            if (!dt){
                dt = "text";
            }
            switch(dt){
                case "text":
                    var table = readTable(dataS.content, dataS, xa && xa.type || null);
                    if (table){
                        res.value = table;
                    }
                    else{
                        lastAjax = loadFromLink(res, dataS.content, dataS, xa);
                    }
                    break;
                case "link":
                    lastAjax = loadFromLink(res, dataS.content, dataS, xa);
                    break;
                default:
                    break;
            }                
        }
        else{
            res.value = null;
        }
    });
    
    chart.cancels.push(proc);
    return res;
}