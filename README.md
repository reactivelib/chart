ReactiveChart is the charting library used by the reactivechart.com service and part of the reactivelib software library.

# Installation

```bash
npm install @reactivelib/chart
```

## commonjs

```javascript
var chart = require("@reactivelib/chart");
chart({});
```

## Browser
We provide a browser ready file "dist/reactivelib.min.js" in the npm package that exposes the global "reactivelib" and includes both this and the 
[reactive](https://github.com/reactivelib/reactive) and [html](https://github.com/reactivelib/html) packages.

```html
<head>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@reactivelib/chart@latest/dist/reactivelib.min.js"></script>
</head>

<body>

    <script type="text/javascript">
        //reactive package
        var reactive = reactivelib.reactive;
        //html package
        var html = reactivelib.html;        
        //chart package
        var chart = reactivelib.chart;        
    </script>
</body>
```


## Typescript

```typescript
import * as chart from '@reactivelib/chart';
chart.create({});
```

### Typescript with "esModuleInterop"

When using "esModuleInterop" option, you can also import as follows:

```typescript
import chart from '@reactivelib/chart';
chart({})
```


# Creating a chart

A new chart is created with the "chart" function by passing a configuration object as follows.

```html
<html>
<head>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@reactivelib/chart@latest/dist/reactivelib.min.js"></script>
</head>

<body>

    <div id="chart" style="width: 600px; height: 400px;">
    </div>

    <script type="text/javascript">
        var chart = reactivelib.chart({
          type: "x",
          xAxis: {
              type: "discrete"
          },
          title: "Chart title",
          series: {
              shape: "column"
          },
          data: {
              content: ",Series 1,Series 2,Series 3\nCategory 1,5,6,7\nCategory 2,6,2,4\nCategory 3,6,2,5"
          }
        });     
        reactivelib.html.attach(document.getElementById("chart"), chart);
    </script>
</body>
</html>
```

For all possible options, take a look at the interface IChartSettings in the code or the API description at reactivechart.com.

## Adding dynamic behaviour

Dynamic behaviour can be created by using the [reactive](https://github.com/reactivelib/reactive) package on the configuration.
E.g., to dynamically change the data or id, we can we can do the following:

```html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@reactivelib/chart@latest/dist/reactivelib.min.js"></script>
</head>
<body>
<div id="chart" style="padding: 40px; width: 400px; height: 400px"></div>

<script type="text/javascript">
    var chart;

    window.onload = function(){
        var series = reactivelib.reactive({
            id: "series id",
            data: [1, 5, 6, 2],
            shape: "column"
        })

        chart = reactivelib.chart({
            type: "x",
            xAxis: {
                type: "discrete",
                categories: ["A", "B", "C", "D"]
            },
            series: [series]
        });

        // Some time later
        setTimeout(function(){
            series.data = [2, 4, 6, 8];
            series.id = "new series id";
        }, 2000);
        reactivelib.html.attach(document.getElementById("chart"), chart);
    };

</script>

</body>
</html>
  
```

Most of the properties can be changed this way

## Sharing configurations

You can create complex chart systems very simply by sharing configurations. E.g., to create 2 synchronized charts by their x-axis, we can do the following:

```html

<!DOCTYPE html>
<html style="height: 100%">
<head>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@reactivelib/chart@latest/dist/reactivelib.min.js"></script>
</head>
<body>
<div id="chart" style="padding: 40px; width: 400px; height: 200px"></div>
<div id="chart2" style="padding: 40px; width: 400px; height: 200px"></div>
<script type="text/javascript">
window.onload = function() {
    var wind = reactivelib.reactive({start: 0, end: 4});
    var chart1 = reactivelib.chart({
        type: "x",
        xAxis: {
            type: "discrete",
            categories: ["A", "B", "C", "D"],
            window: wind
        },
        series: [{
            id: "series id",
            data: [3, 6, 3, 2],
            shape: "column"
        }]
    });
    reactivelib.html.attach(document.getElementById("chart"), chart1);
    var chart2 = reactivelib.chart({
        type: "x",
        xAxis: {
            type: "discrete",
            categories: ["E", "F", "G", "H"],
            window: wind
        },
        series: [{
            id: "series id",
            data: [6, 2, 4, 8],
            shape: "column"
        }]
    });
    reactivelib.html.attach(document.getElementById("chart2"), chart2);
}
</script>
</body>
</html>
```

We create a reactive window object and pass it to the configurations of both charts as the window to use. This will cause the x-axis window of both charts to remain the same, no matter to which chart the user is zooming in.

# More information

For more information and examples, please visit https://reactivechart.com
