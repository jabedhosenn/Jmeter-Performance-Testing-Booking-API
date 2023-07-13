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

    var data = {"OkPercent": 99.07857142857142, "KoPercent": 0.9214285714285714};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1350952380952381, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.026642857142857142, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.03719047619047619, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.00907142857142857, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.8699285714285714, 500, 1500, "Auth"], "isController": false}, {"data": [0.054380952380952384, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.0485, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.015452380952380952, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.019595238095238096, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 168000, 1548, 0.9214285714285714, 3603.118750000022, 0, 25181, 3066.0, 5914.0, 6048.0, 6122.0, 535.3267883260523, 202.0356010238125, 152.89448635314997], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 21000, 304, 1.4476190476190476, 2968.354714285717, 0, 25181, 3125.0, 3602.0, 3738.0, 4233.94000000001, 67.8676000077563, 29.08539155464473, 12.385234196746557], "isController": false}, {"data": ["GetBooking after Update", 21000, 191, 0.9095238095238095, 2965.5046666666526, 0, 11311, 3142.0, 3572.0, 3695.0, 4100.0, 68.06116429965061, 28.643131438464607, 12.418190505832193], "isController": false}, {"data": ["PartialUpdateBooking", 21000, 351, 1.6714285714285715, 5528.873904761907, 3, 16157, 5917.0, 6633.0, 6834.950000000001, 7259.0, 67.9016137950212, 27.572415883844588, 20.89599223355083], "isController": false}, {"data": ["Auth", 21000, 9, 0.04285714285714286, 641.1090952380961, 5, 11466, 270.0, 817.0, 2212.0, 6172.990000000002, 68.68199256272138, 18.22498902314583, 17.231003705557026], "isController": false}, {"data": ["Create Booking", 21000, 27, 0.12857142857142856, 2824.451857142866, 107, 12073, 3040.0, 3449.0, 3602.9500000000007, 3789.9900000000016, 68.8870154536538, 30.09785633756442, 30.709010765031312], "isController": false}, {"data": ["GetBooking", 21000, 74, 0.3523809523809524, 2869.4838095238033, 1, 12191, 3074.0, 3551.0, 3686.0, 3861.0, 68.60973800881472, 28.196761370226312, 12.546058242929112], "isController": false}, {"data": ["UpdateBooking ", 21000, 207, 0.9857142857142858, 5520.713380952418, 7, 10340, 5959.0, 6689.9000000000015, 6961.0, 7227.0, 68.19886789879288, 27.791111612115692, 32.824675832107374], "isController": false}, {"data": ["DeleteBooking", 21000, 385, 1.8333333333333333, 5506.458571428568, 4, 10070, 5873.0, 6683.0, 6952.0, 7176.990000000002, 67.88559015206371, 16.498654461133885, 17.063171254129706], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 231, 14.922480620155039, 0.1375], "isController": false}, {"data": ["403/Forbidden", 658, 42.50645994832041, 0.39166666666666666], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 231, 14.922480620155039, 0.1375], "isController": false}, {"data": ["404/Not Found", 428, 27.64857881136951, 0.25476190476190474], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 168000, 1548, "403/Forbidden", 658, "404/Not Found", 428, "503/Service Unavailable", 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 231, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 21000, 304, "404/Not Found", 229, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 68, "503/Service Unavailable", 7, "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 21000, 191, "404/Not Found", 96, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 72, "503/Service Unavailable", 23, "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 21000, 351, "403/Forbidden", 233, "503/Service Unavailable", 68, "404/Not Found", 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 23, "", ""], "isController": false}, {"data": ["Auth", 21000, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 8, "503/Service Unavailable", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 21000, 27, "503/Service Unavailable", 26, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 21000, 74, "503/Service Unavailable", 26, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 26, "404/Not Found", 22, "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 21000, 207, "403/Forbidden", 82, "503/Service Unavailable", 72, "404/Not Found", 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 26, "", ""], "isController": false}, {"data": ["DeleteBooking", 21000, 385, "403/Forbidden", 343, "404/Not Found", 27, "503/Service Unavailable", 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 7, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
