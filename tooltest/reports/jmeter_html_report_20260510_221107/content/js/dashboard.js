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

    var data = {"OkPercent": 70.2431289640592, "KoPercent": 29.756871035940804};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5528541226215645, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6666666666666666, 500, 1500, "Step1 - Login"], "isController": false}, {"data": [0.7619047619047619, 500, 1500, "TC-ORDER-001 POST /enrollments"], "isController": false}, {"data": [0.0, 500, 1500, "TC-COURSE-001 GET /courses?search=Spring+Boot"], "isController": false}, {"data": [0.841, 500, 1500, "TC-COURSE-003 GET /courses/{id}"], "isController": false}, {"data": [0.5366666666666666, 500, 1500, "TC-AUTH-019 POST /auth/login"], "isController": false}, {"data": [0.44, 500, 1500, "Step1 - Admin Login"], "isController": false}, {"data": [0.505, 500, 1500, "TC-ADM-020 GET /orders/admin"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1892, 563, 29.756871035940804, 369.7642706131077, 0, 2310, 226.5, 1028.1000000000001, 1234.6999999999998, 1908.4999999999968, 64.09431213794505, 104.59791918975914, 10.103794378197094], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step1 - Login", 21, 0, 0.0, 778.5714285714287, 189, 1723, 811.0, 1636.6000000000004, 1722.3, 1723.0, 0.7286353700426772, 0.48999237751986396, 0.18785130633912772], "isController": false}, {"data": ["TC-ORDER-001 POST /enrollments", 21, 0, 0.0, 550.5714285714286, 20, 2119, 238.0, 1720.2000000000003, 2089.5999999999995, 2119.0, 0.7489033914625013, 0.44208424717378125, 0.31580431332691417], "isController": false}, {"data": ["TC-COURSE-001 GET /courses?search=Spring+Boot", 500, 500, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 17.136785824450765, 20.48381430578881, 0.0], "isController": false}, {"data": ["TC-COURSE-003 GET /courses/{id}", 1000, 3, 0.3, 345.5389999999994, 8, 1978, 320.0, 687.9, 811.8999999999999, 1220.96, 51.253139254779356, 105.34041694428784, 9.259600353646661], "isController": false}, {"data": ["TC-AUTH-019 POST /auth/login", 150, 54, 36.0, 760.4866666666668, 166, 2202, 699.5, 1384.6000000000004, 1806.5499999999997, 2137.740000000001, 5.08336722244815, 3.4203515783855227, 1.3105556120374136], "isController": false}, {"data": ["Step1 - Admin Login", 100, 0, 0.0, 1147.84, 394, 2239, 1093.0, 1822.700000000001, 1997.9499999999996, 2237.2599999999993, 5.840780328251855, 3.821604316336663, 1.4830106302201975], "isController": false}, {"data": ["TC-ADM-020 GET /orders/admin", 100, 6, 6.0, 972.8600000000006, 45, 2310, 899.0, 1561.5000000000002, 2063.5499999999997, 2309.69, 6.076810889645114, 14.693538830821586, 2.3856230250364607], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,524 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,308 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,846 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,151 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,565 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,048 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.3552397868561279, 0.10570824524312897], "isController": false}, {"data": ["The operation lasted too long: It took 1,543 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,245 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,150 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,279 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,161 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,179 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,978 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,284 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,273 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,800 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 49: http://127.0.0.1:8080/api/v1/courses?searchSpring Boot&amp;page1&amp;pageSize10", 500, 88.80994671403197, 26.427061310782243], "isController": false}, {"data": ["The operation lasted too long: It took 2,076 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,404 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,169 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,125 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,620 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,067 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,171 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, 0.3552397868561279, 0.10570824524312897], "isController": false}, {"data": ["The operation lasted too long: It took 1,034 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,023 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,817 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,828 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,035 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,236 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,079 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,272 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,053 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,301 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,323 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,148 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,003 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,044 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,319 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,202 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,345 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,389 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,200 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,798 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,222 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,237 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,055 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,309 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,015 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,184 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,087 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,256 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,270 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,905 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,187 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,086 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,149 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,064 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,612 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 2,310 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,153 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}, {"data": ["The operation lasted too long: It took 1,903 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, 0.17761989342806395, 0.052854122621564484], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1892, 563, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 49: http://127.0.0.1:8080/api/v1/courses?searchSpring Boot&amp;page1&amp;pageSize10", 500, "The operation lasted too long: It took 1,048 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,171 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,524 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 1,308 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["TC-COURSE-001 GET /courses?search=Spring+Boot", 500, 500, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 49: http://127.0.0.1:8080/api/v1/courses?searchSpring Boot&amp;page1&amp;pageSize10", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["TC-COURSE-003 GET /courses/{id}", 1000, 3, "The operation lasted too long: It took 1,978 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "The operation lasted too long: It took 1,846 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "The operation lasted too long: It took 1,800 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": ["TC-AUTH-019 POST /auth/login", 150, 54, "The operation lasted too long: It took 1,048 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,171 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 2, "The operation lasted too long: It took 1,524 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 1,308 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1, "The operation lasted too long: It took 1,151 milliseconds, but should not have lasted longer than 1,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["TC-ADM-020 GET /orders/admin", 100, 6, "The operation lasted too long: It took 2,279 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,310 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,086 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,087 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,064 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
