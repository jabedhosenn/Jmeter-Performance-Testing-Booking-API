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

    var data = {"OkPercent": 95.0225, "KoPercent": 4.9775};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1116775, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0148, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.01812, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.01168, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.76348, 500, 1500, "Auth"], "isController": false}, {"data": [0.03238, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.02918, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.01468, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.0091, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 200000, 9955, 4.9775, 5599.143784999993, 0, 34552, 4309.0, 8352.0, 8590.95, 8673.0, 415.73299963831226, 173.56660092996876, 117.7727619338756], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 25000, 2025, 8.1, 4723.936520000007, 0, 17672, 4423.0, 5915.9000000000015, 7558.9000000000015, 8968.950000000008, 52.376971731100824, 30.844639066359527, 9.353559404782855], "isController": false}, {"data": ["GetBooking after Update", 25000, 1186, 4.744, 4756.539279999966, 0, 16390, 4396.0, 7189.9000000000015, 7551.950000000001, 8935.0, 52.37247302817639, 26.34024227178695, 9.351217578165915], "isController": false}, {"data": ["PartialUpdateBooking", 25000, 2240, 8.96, 8956.464639999958, 0, 24683, 8559.0, 10997.900000000001, 14365.95, 15921.990000000002, 52.37192445873616, 22.709182467712708, 15.853785524531009], "isController": false}, {"data": ["Auth", 25000, 278, 1.112, 669.8975200000001, 0, 34552, 272.0, 839.0, 1499.9500000000007, 4361.990000000002, 52.2504258409706, 14.873971564665128, 12.96780867592196], "isController": false}, {"data": ["Create Booking", 25000, 114, 0.456, 4265.89724000002, 256, 16063, 3852.5, 6994.0, 7379.950000000001, 8829.0, 52.36786540201763, 22.927766335762854, 23.34586441802544], "isController": false}, {"data": ["GetBooking", 25000, 207, 0.828, 4315.600919999995, 0, 16488, 3870.0, 6965.0, 7367.0, 8464.81000000003, 52.37389936250489, 21.798632717163137, 9.55148735654789], "isController": false}, {"data": ["UpdateBooking ", 25000, 1132, 4.528, 8914.668719999998, 0, 19739, 8226.0, 13904.900000000001, 14572.0, 16061.980000000003, 52.37335076318447, 21.73746512589506, 25.159357785534272], "isController": false}, {"data": ["DeleteBooking", 25000, 2773, 11.092, 8190.145439999986, 0, 17484, 7777.0, 9557.900000000001, 13388.95, 14325.94000000001, 52.386191000052385, 13.660405289040808, 13.081861199512808], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 2417, 24.27925665494726, 1.2085], "isController": false}, {"data": ["403/Forbidden", 3527, 35.429432446007034, 1.7635], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2320, 23.304871923656453, 1.16], "isController": false}, {"data": ["404/Not Found", 1690, 16.976393771973882, 0.845], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 1, 0.010045203415369162, 5.0E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 200000, 9955, "403/Forbidden", 3527, "503/Service Unavailable", 2417, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2320, "404/Not Found", 1690, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 25000, 2025, "404/Not Found", 1227, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 627, "503/Service Unavailable", 171, "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 25000, 1186, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 631, "503/Service Unavailable", 441, "404/Not Found", 114, "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 25000, 2240, "403/Forbidden", 1066, "503/Service Unavailable", 630, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 430, "404/Not Found", 114, "", ""], "isController": false}, {"data": ["Auth", 25000, 278, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 277, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 25000, 114, "503/Service Unavailable", 114, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 25000, 207, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 114, "503/Service Unavailable", 86, "404/Not Found", 7, "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 25000, 1132, "503/Service Unavailable", 634, "403/Forbidden", 308, "404/Not Found", 114, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 76, "", ""], "isController": false}, {"data": ["DeleteBooking", 25000, 2773, "403/Forbidden", 2153, "503/Service Unavailable", 341, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 165, "404/Not Found", 114, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
