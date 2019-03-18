function TableRow(rowId, trElement) {
    this.rowId = rowId;
    this.cells = [];
    var tdElements = trElement.getElementsByTagName("td");
    for (var i = 0; i < tdElements.length; i++) {
        this.cells.push(tdElements[i].innerHTML);
    }
}

function DynamicTable(tableId) {
    this.testFunc = function () {
        console.log(this.rows);
    }

    this.rows = []
    var rowId = 0;
    document.getElementById(tableId).childNodes.forEach(element => {
        if (element.nodeType == Node.ELEMENT_NODE) {
            if (element.tagName == "tr") {
                var row = new TableRow(rowId, element);
                this.rows.push(row);
                rowId++;
            }
            if (element.tagName == "TBODY") {
                var trElements = element.getElementsByTagName("tr");
                for (var i = 0; i < trElements.length; i++) {
                    var row = new TableRow(rowId, trElements[i]);
                    this.rows.push(row);
                    rowId++;
                }
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

    var filterBar = document.createElement("tr");
    for (var i = 0; i < this.numCols; i++) {
        var filterInput = document.createElement("input");
        filterInput.setAttribute("type", "text");
        filterInput.oninput = this.testFunc.bind(this);
        var cellElement = document.createElement("td");
        cellElement.appendChild(filterInput);
        filterBar.appendChild(cellElement);
    }
    
    var tmp = document.getElementById(tableId).getElementsByTagName("thead");
    if (tmp.length < 1) {
        document.getElementById(tableId).insertBefore(filterBar, document.getElementById(tableId).childNodes[0]);
    }
    else {
        if (tmp[0].childNodes.length < 1)
            tmp[0].appendChild(filterBar);
        else
            tmp[0].insertBefore(filterBar, tmp[0].childNodes[0]);
    }
}

myTable = new DynamicTable("rubiks_cube");
console.log(myTable);