/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 95.32625, "KoPercent": 4.67375};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.12130625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.023466666666666667, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.029033333333333335, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.017616666666666666, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.7829, 500, 1500, "Auth"], "isController": false}, {"data": [0.041883333333333335, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.03833333333333333, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.022133333333333335, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.015083333333333334, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 240000, 11217, 4.67375, 6987.312270833214, 0, 33393, 4942.0, 9717.0, 9864.0, 10291.990000000002, 394.60314432938844, 178.10029170318114, 111.75370102296755], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 30000, 2187, 7.29, 5776.230333333339, 0, 23325, 5748.0, 8849.900000000001, 9386.900000000001, 10001.990000000002, 49.611951849947, 40.615119921906654, 8.749518286035228], "isController": false}, {"data": ["GetBooking after Update", 30000, 694, 2.3133333333333335, 5954.082866666645, 0, 32233, 5734.0, 8477.900000000001, 9124.900000000001, 9966.0, 49.61145958567816, 26.734044218177143, 9.002036485817738], "isController": false}, {"data": ["PartialUpdateBooking", 30000, 2563, 8.543333333333333, 11122.620733333304, 0, 29913, 11041.0, 17310.9, 18209.95, 19174.970000000005, 49.61170571659148, 20.747011334000884, 15.18275330961756], "isController": false}, {"data": ["Auth", 30000, 490, 1.6333333333333333, 655.195466666667, 0, 16015, 273.0, 811.0, 851.0, 3249.9100000000144, 49.89214980284285, 14.667366308787503, 12.317238169116093], "isController": false}, {"data": ["Create Booking", 30000, 219, 0.73, 5404.895066666648, 268, 21534, 5454.5, 8253.0, 8797.0, 9897.970000000005, 49.872907208131274, 21.86097714116859, 22.232038389358618], "isController": false}, {"data": ["GetBooking", 30000, 420, 1.4, 5454.114066666635, 0, 12427, 5286.0, 8434.0, 9168.0, 9880.990000000002, 49.74274709295096, 20.954846293357022, 9.037981877680927], "isController": false}, {"data": ["UpdateBooking ", 30000, 1193, 3.9766666666666666, 11072.18966666659, 0, 24395, 10675.5, 17180.0, 18502.95, 19073.0, 49.61096733117802, 20.497236255694926, 23.754824472780115], "isController": false}, {"data": ["DeleteBooking", 30000, 3451, 11.503333333333334, 10459.169966666632, 0, 33393, 10345.0, 16746.0, 17769.0, 19124.99, 49.61277231210403, 13.30967753713516, 12.335384110868835], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 2740, 24.42720870107872, 1.1416666666666666], "isController": false}, {"data": ["403/Forbidden", 4063, 36.22180618703753, 1.6929166666666666], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2683, 23.919051439778908, 1.1179166666666667], "isController": false}, {"data": ["404/Not Found", 1731, 15.43193367210484, 0.72125], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 240000, 11217, "403/Forbidden", 4063, "503/Service Unavailable", 2740, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2683, "404/Not Found", 1731, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 30000, 2187, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1085, "404/Not Found", 806, "503/Service Unavailable", 296, "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 30000, 694, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 253, "404/Not Found", 239, "503/Service Unavailable", 202, "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 30000, 2563, "403/Forbidden", 1091, "503/Service Unavailable", 1085, "404/Not Found", 219, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 168, "", ""], "isController": false}, {"data": ["Auth", 30000, 490, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 490, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 30000, 219, "503/Service Unavailable", 219, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 30000, 420, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 219, "503/Service Unavailable", 172, "404/Not Found", 29, "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 30000, 1193, "403/Forbidden", 549, "503/Service Unavailable", 253, "404/Not Found", 219, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 172, "", ""], "isController": false}, {"data": ["DeleteBooking", 30000, 3451, "403/Forbidden", 2423, "503/Service Unavailable", 513, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 296, "404/Not Found", 219, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
