function TableRow(rowId, trElement) {
    this.rowId = rowId;
    this.attributes = trElement.attributes
    this.cells = [];
    var tdElements = trElement.getElementsByTagName("td");
    for (var i = 0; i < tdElements.length; i++) {
        this.cells.push(tdElements[i]);
    }
}

function DynamicTable(tableId) {
    this.redraw = function () {
        console.log(this.filters);
        console.log(this.orders);
    }

    this.setFilter = function (column) {
        this.filters[column] = this.filterBar.childNodes[column].childNodes[0].value;
        this.redraw();
    }

    this.setOrder = function (column, order) {
        this.orders[column] = order;
        this.redraw();
    }

    this.rows = []
    var rowId = 0;
    document.getElementById(tableId).childNodes.forEach(element => {
        if (element.nodeType == Node.ELEMENT_NODE) {
            if (element.tagName == "tr") {
                var row = new TableRow(rowId, element);
                this.rows.push(row);
                rowId++;
                // document.getElementById(tableId).removeChild(element);
            }
            if (element.tagName == "TBODY") {
                var trElements = element.getElementsByTagName("tr");
                for (var i = 0; i < trElements.length; i++) {
                    var row = new TableRow(rowId, trElements[i]);
                    this.rows.push(row);
                    rowId++;
                }
                // document.getElementById(tableId).removeChild(element);
            }
        }
    });

    if (this.rows.length < 1)
        return;
    this.numCols = this.rows[0].cells.length;

    this.filters = [];
    for (var i = 0; i < this.numCols; i++) {
        this.filters[i] = "";
    }
    
    this.orders = [];
    for (var i = 0; i < this.numCols; i++) {
        this.orders[i] = 0;
    }

    this.filterBar = document.createElement("tr");
    for (var i = 0; i < this.numCols; i++) {
        var filterInput = document.createElement("input");
        filterInput.setAttribute("type", "text");
        filterInput.oninput = this.setFilter.bind(this, i);
        var cellElement = document.createElement("td");
        cellElement.appendChild(filterInput);
        this.filterBar.appendChild(cellElement);
    }

    this.sortBar = document.createElement("tr");
    for (var i = 0; i < this.numCols; i++) {
        var cellElement = document.createElement("td");
        for (var j = 0; j < 3; j++) {
            var sortButton = document.createElement("button");
            sortButton.setAttribute("class", "sort_button_" + j);
            sortButton.onclick = this.setOrder.bind(this, i, j);
            cellElement.appendChild(sortButton);
        }
        this.sortBar.appendChild(cellElement);
    }
    
    var tmp = document.getElementById(tableId).getElementsByTagName("thead");
    if (tmp.length < 1) {
        document.getElementById(tableId).insertBefore(this.sortBar, document.getElementById(tableId).childNodes[0]);
        document.getElementById(tableId).insertBefore(this.filterBar, document.getElementById(tableId).childNodes[0]);
    }
    else {
        if (tmp[0].childNodes.length < 1) {
            tmp[0].appendChild(this.filterBar);
            tmp[0].appendChild(this.sortBar);
        }
        else {
            tmp[0].insertBefore(this.sortBar, tmp[0].childNodes[0]);
            tmp[0].insertBefore(this.filterBar, tmp[0].childNodes[0]);
        }
    }
}

myTable = new DynamicTable("rubiks_cube");
// console.log(myTable);