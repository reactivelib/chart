/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {html} from "@reactivelib/html";
import {IPaddingSettings} from "../geometry/rectangle/index";
import {IDataLabelSettings} from "./cartesian/label/data";
import {ITickLineSettings} from "./cartesian/grid/index";
import {ICenterBorderSettings} from "./core/basic";
import {ILabelStyle} from "./render/canvas/label/cache/index";
import {IInteractionButtonSettings} from "./cartesian/component/toolbar";
import {IXYTooltipSettings} from "./cartesian/tooltip";
import {IBorderStyle} from "./render/style/border";

export interface ISeriesStyleSettings{
    /**
     * The default colors to use for series
     */
    colors?: string[];
}

export interface IAxisStyleSettings{
    /**
     * Style of the axis labels
     */
    label?: ILabelStyle;
    /**
     * Space added around each axis label 
     */
    labelSpace?: number | IPaddingSettings;
    /**
     * If true, will set the fill color of the labels to the color of the first series in the axis. 
     */
    seriesColor?: boolean;    
    /**
     * Space around the whole axis.
     */
    space?: number | IPaddingSettings;
    
}

export interface ILegendStyleSettings{
    /**
     * The style for legend labels.
     */
    labelStyle?: ILabelStyle;
    /**
     * Space around the legend
     */
    space?: number | IPaddingSettings;
}

export interface ITitleSettings
{
    style?: ILabelStyle;
    space?: number | IPaddingSettings;
}

export interface IGlobalInteractionSettings{
    button?: IInteractionButtonSettings;
}

export interface IGlobalChartSettings{
    
    series?: ISeriesStyleSettings;
    /**
     * The style of the chart div. Use this to change background-color of the chart, or add a border.
     */
    chart?: html.ICSSStyle;

    /**
     * Style of the tick lines. If false, will not draw tick-lines.
     */
    xTickLines?: boolean | ITickLineSettings;

    /**
     * Style of the tick lines. If false, will not draw tick-lines.
     */
    yTickLines?: boolean | ITickLineSettings;
    
    /**
     * The technology to render labels. The technology determines the styling options available, performance and printing capabilities.
     * 
     * 
     * |value|description|
     * |--|--|
     * |"html"|Uses html to render labels. Html styling options and very good rendering quality, but less performant than "canvas". Also, older browsers do not support generating images from html. Only modern browsers support text rotation.|
     * |"svg"|Uses svg to render labels. Svg styling options, but less performant than "canvas" in general. However, supports rotation and generating images.
     * |"canvas"|Uses canvas buffers to render labels. Canvas text styling options. Most performant, however, the quality of labels is worse than "html" or "svg" in many browsers. Supports rotation and image generation.|
     * 
     */
    labelRenderer?: "html" | "canvas" | "svg";
    /**
     * Global settings for data label renderers
     */
    dataLabels?: IDataLabelSettings;
    title?: ITitleSettings;
    subtitle?: ITitleSettings;
    /**
     * The default font style.
     * 
     * 
     * e.g.:
     * ```.javascript
     * {
     *  font: "20px Arial"
     * }
     * ```
     */
    font?: ILabelStyle;
    /**
     * Style for the y-axes
     */
    yAxis?: IAxisStyleSettings;
    /**
     * Style for the x-axes
     */
    xAxis?: IAxisStyleSettings;
    legend?: ILegendStyleSettings;
    tooltip?: IXYTooltipSettings;
    center?: ICenterStyleSettings;
    /**
     * Icon settings. Icons must be base64 encoded strings.
     */
    icons?: IIconSettings;
    interaction?: IGlobalInteractionSettings;
    
}

export interface ICenterStyleSettings{
    /**
     * Style for a border around the center. If false, will not draw border.
     */
    border?: string | IBorderStyle;
}

export interface IIconSettings{
    maximize: string;
    move: string;
    xmove: string;
    select: string;
    zoom: string;
    cursor: string;
}

export var defaultTheme = <IGlobalChartSettings>{
    labelRenderer: "svg",
    font: {
        fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
        fontSize: "14px",
        fill: "rgb(0, 0, 0)"
    },
    interaction: {
        button: {
            style: {
                backgroundPosition: "center",
                opacity: 0.8,
                border: "none",
                padding: "2",
                margin: "0",
                width: "28px",
                height: "28px",
                backgroundColor: "rgb(255, 255, 255)"
            },
            activeStyle: {
                backgroundPosition: "center",
                opacity: 0.8,
                border: "none",
                padding: "2",
                margin: "0",
                width: "28px",
                height: "28px",
                backgroundColor: "rgba(200, 200, 200, 0.8)"
            }
        }
    },
    icons: {
        maximize: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAABH0lEQVRIx9WVQY6DMAxFH2g2XfUK4BOw7qpHGU4GR+gROAInsHqFrlimG6di0hSHSh2pkSIhjP+Pjf9PFULgk6vmw+snPohIrpReVcctABH5BYb0vapWXgUuuAGNQL+3RQsw7+jEbDlFBAtwACYR6Txk+2aynMUj6IETcAOOHskK/Gg5p7RdddpzVZ2Bs0eSAT+r6pz+k+qVDjIAnapeLdZY3/+A79JBUsklglvsClw8cABCCJu7bdvmnVjc1ddbRV0w5807sSICm6RZRMZMbLTYphj/b0zNFbdElI7pSzGusR4VmF33drKp5HS5gwAdMES7TgnWZueL6Jkk5m7eB9EVXfBE8Q/wkik6WKmlq8uBe2M6rH/W3ivTHdOvsYo7ljLtCzSD2IQAAAAASUVORK5CYII=",
        move: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAApElEQVRIx92W0Q2AIBBDy43SxXQ0WOxWwR81GBE4BWPsL7HPu5YEF2PESAkGywQg6Un6IYDVeAIwWSBiNN/UDJEb5iaIs7SIZAQAVXXfbpG1KaVvxLDzmrKZSCfzS8gecgfzVEFV51dCPtQ0nSJXxVJNt7P0708TrAehx2ouW/QAcjL/x02uTlCpb3YtpgkKmVTNm1eUgTSZ3wnZJ0B0B3zyVbEAe8Rp8yh9VJoAAAAASUVORK5CYII=",
        xmove: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAdUlEQVRIx+2VwQ3AIAhFwU10MTuaLsYqv5e2MSpNbKQnfsJFhAeSIAMgSwUylgMcYARIKZXVRFpMUC7mD8XmGSRsSq5C+F4VG5K3qiJy/DJkbpdd24WI8OKQ0Vc/dHA56o6neQRgsBhjmZ2/mRbD/h84wAF0AvhcbLmlKq38AAAAAElFTkSuQmCC",
        select: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAWUlEQVRIx2P8//8/Ay0BEwONAQuMoaSkhOKVe/fuMSLzyZWnnw9wuYyQOLo8uk9o7gPGIZ+KhpEFSkpK/9FTADkA3ZzROBjNB6P5YCDqA5jtlNZoo/mAaAAAYBg16tLoH5oAAAAASUVORK5CYII=",
        zoom: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAA70lEQVRIx82UwQ3CMAxFfxB3dvAEHaFM0BE6Ah0lbFBGyAYdgQn+DHSCcDESikrjpK2EL5ES2c/+se1ijDjSTjjYzkuXItICGAB0yVMA4ElOVoBLJRKREUCf8buTHIolEhGfBifpSLrE76aJ2AEqy61A3l59zBUMFX84lAC6CkBX3EULei/ei0j8zzlIM/tkbs14rYJQ4R9KAL4C4M0AHf9HQfAZwKtmVXjDwM0ALnq2JJ/mLtIdc/2hb9C39gsyiUhjrsBqGnTKVVI9BxosW8mmQbNANk9yDrLLqliD7LaLFiDNpi7KdFdDcjwEkNob2JZycyJeiQwAAAAASUVORK5CYII=",
        cursor: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAvElEQVRIx92VwQ3CMAxFfyvudAScBRAbMAKjdISyASt0k45AF7AYgQ3MpUgIkdZ2nAuWIiWR4qcvfzuNiKBmtKgcWUBKqautYIqArAGOEZCtGhRDNEUugmhd5IZYbOqCWPvADPE0mgni7WQ1pGRUqCCls2gTEjHsViE7R8IrMw/RLpoBnJZ9H23TGcCZme8ARgB7AH0U4J38uZwHq4rWkBzM/PhQcVFJEJGfi4i6zP2BiG65d9+r+d9PPype5ZdyCgDXi7QAAAAASUVORK5CYII=",
        cancel: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAAtElEQVRIx9WWwQ0DIQwEF5fixi6lHY3RCvmET4D1+k6nKLzxjMCsRem948lleHhNAnc/3f3MgnZ19r0JwAHgyEhYnS02jSVJorqoB1SygO970Fp7AaiqhMDrhzWfQJWocAAoqxwwwBAq8K1Avd8ITptMrkuGh69IkFD4b0ZFsg9hGO1OiBSJJeE1E8btNGXvPJt4uxL/jMSuxD8jsTshUsLIpmkYIqVumkXjeApcqSt//6t4Awpfk9WDDtyaAAAAAElFTkSuQmCC"
    },
    series: {
        colors: ["rgb(65, 130, 187)", "rgb(216, 65, 71)", "rgb(97, 170, 81)", "rgb(133, 78, 146)", "rgb(200, 117, 41)", "rgb(105, 105, 105)", "rgb(0, 170, 157)", "rgb(180, 177, 0)"]
    },
    tooltip: {
        content: {
            div: {
                style: {
                    background: "#EEEEEE",
                    border: "solid thin black",
                    padding: "5px"
                }
            },
            table: {
                style: {
                    borderCollapse: "collapse",
                    margin: "0px", padding: "0px", border: "none",
                    color: "black"
                }
            },
            td: {
                style: {
                    margin: "0px", padding: "3px", border: "none"
                }
            },
            th: {
                style: {
                    margin: "0px", padding: "3px", border: "none"
                }
            },
            tbody: {
                style: {
                    margin: "0px", padding: "0px", border: "none"
                }
            },
            thead: {
                style: {
                    margin: "0px", padding: "0px", border: "none"
                }
            },
            tfoot: {
                style: {
                    margin: "0px", padding: "0px", border: "none"
                }
            },
            decimal: {
                format: ",###.###"
            }
        },
        delay: 500,
        margin: 10
    },
    chart: {
    },
    title: {
        style: {
            fontSize: "26px"
        },
        space: {
            bottom: 5
        }
    },
    subtitle: {
        style: {
            fontSize: "20px",
            fontStyle: "italic"
        },
        space: {
            bottom: 5
        }
    },
    dataLabels: {
        style: {
            fontSize: "18px",
            background: "rgba(255, 255, 255, 0.7)"
        }
    },
    legend: {
        backgroundStyle: {
            fillStyle: "rgba(255, 255, 255, 0.7)"
        }
    },
    xAxis: {
        labelSpace: {left: 2, right: 2, top: 1, bottom: 1}        
    },
    yAxis: {
        labelSpace: {top: 1, bottom: 1, left: 1, right: 1}        
    },
    xTickLines: {
        style: {
            strokeStyle: "rgba(0, 0, 0, 0.2)"
        }
    },
    yTickLines: {
        style: {
            strokeStyle: "rgba(0, 0, 0, 0.2)"
        }
    },
    center: {
        border: "1px solid black"
    }
    
}

export var darkTheme = <IGlobalChartSettings>{
    labelRenderer: "svg",
    font: {
        fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
        fontSize: "14px",
        fill: "rgb(255, 255, 255)"
    },
    icons: {
        maximize: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJ5JREFUeNpiYqAxYKKbBf+xgwRCBoDUYNOITSHJhuOzhFAQfQDiCySExAWoHryugIH3SLQBEa43QNODN4gSsGgwIMFwA1hwYQ1HfBqJMRybWaR4XQFJToHUoCRkyXwscvMpMhzZteTI0Q0wDbgFNA0imkYy1ZMpzTMaPYoKuhR2/8nJ/miWEFUfCAAxKanDAKqHqPqANlXmkC0qAAIMANMwRfP5flZBAAAAAElFTkSuQmCC",
        move: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGhJREFUeNrkVUEKACAIE///hz3VKAi6iBnNi4OObbTNFGkFM8M8TPINMMn/ijjktJcsZO4ouxjq2fJiZcrzrEVXmZyBPgr4IkFbskBZyHUWlYQcVS4QQKNJjoKv+lGpO4G61SCtMAQYALnBc1q2Us3KAAAAAElFTkSuQmCC",
        xmove: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAERJREFUeNpiYBgFo2AUYAX///+fTzM9IIVA/J8MC/4TtARmOAUW4LYE2XAqALglTHSPXJoFEV0imS7JdBSMghEIAAIMAH10qhOjttkiAAAAAElFTkSuQmCC",
        select: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEJJREFUeNpiYBjqgBHG+A8EKBJAgMwnV56Jbl75DwXUNoeJYRSMHDBkU9HQt2AUjOYDygELNhdQo0YbzQdEA4AAAwAADUfgBuGWMwAAAABJRU5ErkJggg==",
        zoom: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJlJREFUeNpiYBiW4P///w5AvP4/JgCJOVBq+Pz/hEE/uYb3o5uEJIcO5pMTLP9JsOA/ScGFI8wJWbCekLmMyAZgVQAExMjjAizEakAXx2UhOmCidZJnwRIX/0kJIlJ8sIEM/RsGPJkyIQXFASC1gATXf4BiynMzFvAeiTagemEHMpRiS4hwxKglo5b8T6BVfW5AM8OxAYAAAwBlseKnF8ExqwAAAABJRU5ErkJggg==",
        cursor: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAINJREFUeNpiYBi24P///wK0tuA8TS35DwG0s+Q/AtDGkv+ogPqW/McE1LXkP3ZAPUv+4wbUseQ/fkC5Jf8JA8os+U8cIN+S/8QD8iz5Txog3RI8hjXQKicbQNnvqZ1M4d4H0vOp5gtsYQtkK1DNF7giDskXCTSp0aC+6GcYBdQCAAEGAOPU49m1ja7bAAAAAElFTkSuQmCC"
    },
    title: {
        style: {
            fontSize: "20px"
        },
        space: {
            bottom: 5
        }
    },
    interaction: {
        button: {
            style: {
                backgroundPosition: "center",
                opacity: 0.8,
                border: "none",
                padding: "2",
                margin: "0",
                width: "28px",
                height: "28px",
                backgroundColor: "rgb(25, 25, 25)"
            },
            activeStyle: {
                backgroundPosition: "center",
                opacity: 0.8,
                border: "none",
                padding: "2",
                margin: "0",
                width: "28px",
                height: "28px",
                backgroundColor: "rgb(125, 125, 125)"
            }
        }
    },
    tooltip: {
        content: {
            div: {
                style: {
                    background: "#EEEEEE",                
                    border: "solid thin black",
                    padding: "5px"
                }
            },
            table: {
                style: {
                    borderCollapse: "collapse",
                    margin: "0px", padding: "0px", border: "none",
                    color: "black"
                }
            },
            td: {
                style: {
                    margin: "0px", padding: "3px", border: "none"
                }
            },
            th: {
                style: {
                    margin: "0px", padding: "3px", border: "none"
                }
            },
            tbody: {
                style: {
                    margin: "0px", padding: "0px", border: "none"
                }
            },
            thead: {
                style: {
                    margin: "0px", padding: "0px", border: "none"
                }
            },
            tfoot: {
                style: {
                    margin: "0px", padding: "0px", border: "none"
                }
            },
            decimal: {
                format: ",###.###"
            }
        },
        delay: 500,
        margin: 10
    },
    subtitle: {
        style: {
            fontSize: "18px"
        },
        space: {
            bottom: 5
        }
    },
    dataLabels: {

    },
    legend: {

    },
    series: {
        colors: ["rgb(90, 155, 212)", "rgb(241, 90, 96)", "rgb(122, 195, 106)", "rgb(250, 167, 91)", "rgb(158, 103, 171)", "rgb(206, 112, 88)", "rgb(215, 127, 180)", "rgb(215, 215 ,215)"]
    },
    xAxis: {
        labelSpace: {left: 2, right: 2, top: 1, bottom: 1}        
    },
    xTickLines: {
        style: {
            strokeStyle: "rgba(255, 255, 255, 0.2)"
        }        
    },
    yAxis: {
        labelSpace: {top: 1, bottom: 1, left: 1, right: 1}        
    },
    yTickLines: {
        style: {
            strokeStyle: "rgba(255, 255, 255, 0.2)"
        }        
    },
    center: {
        border: "1px solid white"
    }
}

var theme: IGlobalChartSettings;

setTheme(defaultTheme);

export type ThemeTypes = "default" | "dark";

export function setTheme(settings: IGlobalChartSettings | ThemeTypes){
    if (typeof settings === "string"){
        switch(settings){
            case "default":
                theme = defaultTheme;
                break;
            case "dark":
                theme = darkTheme;
                break;
            default:
                throw new Error("Unknown theme "+settings);
        }
    }
    else{
        theme = settings;
    }
}

export function getTheme(){
    return theme;
}