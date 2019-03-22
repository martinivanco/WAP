const STRCOL = 1;
const NUMCOL = 3;

function TableRow(rowId, trElement) {
    this.rowId = rowId;
    this.trElement = trElement;
    this.cells = [];
    var tdElements = trElement.getElementsByTagName("td");
    for (var i = 0; i < tdElements.length; i++) {
        this.cells.push(tdElements[i].innerText);
    }
}

function DynamicTable(tableId) {
    this.filterRows = function () {
        var filteredRows = this.rows.slice();
        for (var i = 0; i < this.filters.length; i++) {
            if (this.filters[i] == "")
                continue;

            for (var j = 0; j < filteredRows.length; j++) {
                if (! filteredRows[j].cells[i].includes(this.filters[i]))
                    delete filteredRows[j];
            }
        }
        return filteredRows;
    }

    this.sortRows = function (filteredRows) {
        var originalOrder = true;
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i] != 0) {
                originalOrder = false;
                break;
            }
        }
        if (originalOrder) {
            var sortedRows = [];
            filteredRows.forEach(row => {
                sortedRows.push(row.trElement);
            });
            return sortedRows;
        }

        var tmpRows = filteredRows.slice();
        for (var i = 0; i < this.orders.length; i++) {
            tmpRows.sort((r1, r2) => {
                if (this.orders[i] == 1) {
                    if (r1.cells[i] < r2.cells[i])
                        return -1;
                    if (r1.cells[i] > r2.cells[i])
                        return 1;
                    return 0;
                }
                if (this.orders[i] == 2) {
                    if (r1.cells[i] < r2.cells[i])
                        return 1;
                    if (r1.cells[i] > r2.cells[i])
                        return -1;
                    return 0;
                }
                if (this.orders[i] == 3) {
                    if (Number(r1.cells[i]) < Number(r2.cells[i]))
                        return -1;
                    if (Number(r1.cells[i]) > Number(r2.cells[i]))
                        return 1;
                    return 0;
                }
                if (this.orders[i] == 6) {
                    if (Number(r1.cells[i]) < Number(r2.cells[i]))
                        return 1;
                    if (Number(r1.cells[i]) > Number(r2.cells[i]))
                        return -1;
                    return 0;
                }
            });
        }
        var sortedRows = [];
        tmpRows.forEach(row => {
            sortedRows.push(row.trElement);
        });
        return sortedRows;
    }

    this.redraw = function () {
        while (this.tbody.firstChild) {
            this.tbody.removeChild(this.tbody.firstChild);
        }

        var filteredRows = this.filterRows();
        var orderedRows = this.sortRows(filteredRows);
        
        orderedRows.forEach(row => {
            this.tbody.appendChild(row);
        });
    }

    this.setFilter = function (column) {
        this.filters[column] = this.filterBar.childNodes[column].childNodes[0].value;
        this.redraw();
    }

    this.setOrder = function (column, order) {
        this.orders[column] = order;
        this.redraw();
    }

    this.getIconClass = function (i) {
        if (i == 0)
            return "fas fa-sort";
        if (i == 1)
            return "fas fa-sort-alpha-down";
        if (i == 2)
            return "fas fa-sort-alpha-up";
        if (i == 3)
            return "fas fa-sort-numeric-down";
        if (i == 6)
            return "fas fa-sort-numeric-up";
        return "fas";
    }

    var iconLink = document.createElement("link");
    iconLink.setAttribute("rel", "stylesheet");
    iconLink.setAttribute("href", "https://use.fontawesome.com/releases/v5.7.0/css/all.css");
    iconLink.setAttribute("integrity", "sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ");
    iconLink.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(iconLink);

    for (var i = 1; i < arguments.length; i++) {
        if ((arguments[i] != STRCOL) && (arguments[i] != NUMCOL)) {
            console.error("Dynamic table: Invalid arguments.");
            return;
        }
    }
    
    var tmp = document.getElementById(tableId).getElementsByTagName("tbody");
    if (tmp.length < 1) {
        console.error("Dynamic table: No <tbody> element inside table.");
        return;
    }
    this.tbody = tmp[0];

    this.rows = [];
    var trElements = this.tbody.getElementsByTagName("tr");
    for (var i = 0; i < trElements.length; i++) {
        this.rows.push(new TableRow(i, trElements[i]));
    }

    if (this.rows.length < 1) {
        console.error("Dynamic table: No rows inside <tbody> element.");
        return;
    }
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
        filterInput.setAttribute("class", "dyntable_filter");
        filterInput.setAttribute("placeholder", "Filter...");
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
            var icon = document.createElement("i");
            sortButton.setAttribute("class", "dyntable_sort");

            if (arguments.length > i + 1) {
                sortButton.onclick = this.setOrder.bind(this, i, j * arguments[i + 1]);
                icon.setAttribute("class", this.getIconClass(j * arguments[i + 1]));
            }
            else {
                sortButton.onclick = this.setOrder.bind(this, i, j);
                icon.setAttribute("class", this.getIconClass(j));
            }

            sortButton.appendChild(icon);
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

myTable = new DynamicTable("rubiks_cube", NUMCOL, STRCOL, STRCOL, STRCOL);
console.log(myTable);