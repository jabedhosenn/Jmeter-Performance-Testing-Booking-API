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

    var data = {"OkPercent": 94.87498645536104, "KoPercent": 5.125013544638962};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1260540507500257, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.02937776493341929, 500, 1500, "GetBooking after Partial Update"], "isController": false}, {"data": [0.027048652012535285, 500, 1500, "GetBooking after Update"], "isController": false}, {"data": [0.014003734329154442, 500, 1500, "PartialUpdateBooking"], "isController": false}, {"data": [0.8318294959551961, 500, 1500, "Auth"], "isController": false}, {"data": [0.03913768196466274, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.03425936215135015, 500, 1500, "GetBooking"], "isController": false}, {"data": [0.017924612170511625, 500, 1500, "UpdateBooking "], "isController": false}, {"data": [0.01474086755452787, 500, 1500, "DeleteBooking"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 359921, 18446, 5.125013544638962, 4493.389829990422, 0, 50657, 3442.0, 6605.9000000000015, 6712.0, 6849.0, 2.1364354061282997E-10, 8.947530036759464E-11, 6.057182004235548E-11], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GetBooking after Partial Update", 44983, 3379, 7.511726652290865, 3808.2595647244502, 0, 24066, 3923.0, 5485.0, 5960.950000000001, 6664.980000000003, 20.794454195849614, 12.508432972318824, 3.73536225032024], "isController": false}, {"data": ["GetBooking after Update", 44993, 1869, 4.153979507923455, 3866.509701509129, 0, 22354, 3925.0, 5493.0, 5686.0, 6191.990000000002, 20.81006290704456, 10.466443337061225, 3.7469306885872347], "isController": false}, {"data": ["PartialUpdateBooking", 44988, 3880, 8.624522094780831, 7147.710700631284, 0, 29844, 7405.0, 10517.0, 10796.0, 11220.0, 20.798717347705846, 8.519657198876754, 6.369698477283823], "isController": false}, {"data": ["Auth", 44996, 751, 1.6690372477553561, 569.4025691172559, 0, 17850, 270.0, 809.0, 1214.0, 4277.820000000029, 2.6708929885766316E-11, 7.869055737765387E-12, 6.5914345797426515E-12], "isController": false}, {"data": ["Create Booking", 44995, 248, 0.5511723524836093, 3543.218135348337, 268, 22914, 3745.0, 5353.0, 5490.0, 6005.0, 20.84442264029971, 9.127690358522218, 9.292517579157385], "isController": false}, {"data": ["GetBooking", 44995, 612, 1.3601511279031004, 3578.3514834981684, 0, 22931, 3734.0, 5313.9000000000015, 5491.0, 5847.990000000002, 20.834905771771307, 8.750533085571057, 3.7948332706866137], "isController": false}, {"data": ["UpdateBooking ", 44994, 2521, 5.602969284793528, 6986.352891496665, 0, 50657, 7267.0, 10429.0, 10839.95, 11312.990000000002, 20.817929866608676, 8.684458333429726, 9.963467342288936], "isController": false}, {"data": ["DeleteBooking", 44977, 5186, 11.530337728172176, 6448.440669675621, 0, 28575, 7115.0, 10400.0, 10600.0, 11080.990000000002, 20.79231492888859, 5.544627938560805, 5.173899368775007], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 3924, 21.272904694784778, 1.0902392469458575], "isController": false}, {"data": ["403/Forbidden", 7316, 39.66171527702483, 2.032668279983663], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 3428, 18.583974845494957, 0.9524312279639143], "isController": false}, {"data": ["404/Not Found", 3778, 20.481405182695436, 1.0496747897455274], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 359921, 18446, "403/Forbidden", 7316, "503/Service Unavailable", 3924, "404/Not Found", 3778, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 3428, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GetBooking after Partial Update", 44983, 3379, "404/Not Found", 2144, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 827, "503/Service Unavailable", 408, "", "", "", ""], "isController": false}, {"data": ["GetBooking after Update", 44993, 1869, "404/Not Found", 838, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 724, "503/Service Unavailable", 307, "", "", "", ""], "isController": false}, {"data": ["PartialUpdateBooking", 44988, 3880, "403/Forbidden", 2496, "503/Service Unavailable", 916, "404/Not Found", 248, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 220, "", ""], "isController": false}, {"data": ["Auth", 44996, 751, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 751, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Create Booking", 44995, 248, "503/Service Unavailable", 248, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GetBooking", 44995, 612, "503/Service Unavailable", 341, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 219, "404/Not Found", 52, "", "", "", ""], "isController": false}, {"data": ["UpdateBooking ", 44994, 2521, "403/Forbidden", 1043, "503/Service Unavailable", 951, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 279, "404/Not Found", 248, "", ""], "isController": false}, {"data": ["DeleteBooking", 44977, 5186, "403/Forbidden", 3777, "503/Service Unavailable", 753, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 408, "404/Not Found", 248, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
