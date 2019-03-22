const STRCOL = 1;
const NUMCOL = 3;

// ------------------------------------------------- //
//           DATA CLASS HOLDING SINGLE ROW           //
// ------------------------------------------------- //
class TableRow {
    constructor(trElement) {
        this.trElement = trElement;
        this.cells = [];
        var tdElements = trElement.getElementsByTagName("td");
        for (var i = 0; i < tdElements.length; i++) {
            this.cells.push(tdElements[i].innerText);
        }
    }
}

class DynamicTable {
    // ------------------------------------------------- //
    //                     FILTERING                     //
    // ------------------------------------------------- //
    filterRows() {
        // create copy of original set of rows
        var filteredRows = this.rows.slice();

        for (var i = 0; i < this.filters.length; i++) {
            // empty filter means no checking
            if (this.filters[i] == "")
                continue;

            // loop through rows and check corresponding cell
            for (var j = 0; j < filteredRows.length; j++) {
                if (!filteredRows[j].cells[i].includes(this.filters[i]))
                    delete filteredRows[j];
            }
        }

        return filteredRows;
    }

    // ------------------------------------------------- //
    //                      SORTING                      //
    // ------------------------------------------------- //
    sortRows(filteredRows) {
        // check if any sorting is set
        var originalOrder = true;
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i] != 0) {
                originalOrder = false;
                break;
            }
        }

        // if no sorting is set, keep the order as it is
        // and return pure array of <tr> elements
        if (originalOrder) {
            var sortedRows = [];
            filteredRows.forEach(row => {
                sortedRows.push(row.trElement);
            });
            return sortedRows;
        }

        for (var i = 0; i < this.orders.length; i++) {

            // SORTING USING CUSTOM COMPARISON FUNCTION
            filteredRows.sort((r1, r2) => {

                // string ascending order
                if (this.orders[i] == 1 * STRCOL) {
                    if (r1.cells[i] < r2.cells[i])
                        return -1;
                    if (r1.cells[i] > r2.cells[i])
                        return 1;
                    return 0;
                }

                // string descending order
                if (this.orders[i] == 2 * STRCOL) {
                    if (r1.cells[i] < r2.cells[i])
                        return 1;
                    if (r1.cells[i] > r2.cells[i])
                        return -1;
                    return 0;
                }

                // number ascending order
                if (this.orders[i] == 1 * NUMCOL) {
                    if (Number(r1.cells[i]) < Number(r2.cells[i]))
                        return -1;
                    if (Number(r1.cells[i]) > Number(r2.cells[i]))
                        return 1;
                    return 0;
                }

                // number descending order
                if (this.orders[i] == 2 * NUMCOL) {
                    if (Number(r1.cells[i]) < Number(r2.cells[i]))
                        return 1;
                    if (Number(r1.cells[i]) > Number(r2.cells[i]))
                        return -1;
                    return 0;
                }
            });
        }

        // return pure array of sorted <tr> elements
        var sortedRows = [];
        filteredRows.forEach(row => {
            sortedRows.push(row.trElement);
        });
        return sortedRows;
    }

    // ------------------------------------------------- //
    //                 AUXILIARY METHODS                 //
    // ------------------------------------------------- //
    // removes currently visible cells, filters and sorts the original set,
    // and appends the newly valid set to the table
    redraw() {
        while (this.tbody.firstChild) {
            this.tbody.removeChild(this.tbody.firstChild);
        }
        var filteredRows = this.filterRows();
        var orderedRows = this.sortRows(filteredRows);
        orderedRows.forEach(row => {
            this.tbody.appendChild(row);
        });
    }

    // called when filter is changed 
    setFilter(column) {
        this.filters[column] = this.filterBar.childNodes[column].childNodes[0].value;
        this.redraw();
    }

    // called when order is changed
    setOrder(column, order) {
        this.orders[column] = order;
        this.redraw();
    }

    // get icon class string corresponding to function of sorting button
    getIconClass(i) {
        switch (i) {
            case 0:
                return "fas fa-sort";
            case 1:
                return "fas fa-sort-alpha-down";
            case 2:
                return "fas fa-sort-alpha-up";
            case 3:
                return "fas fa-sort-numeric-down";
            case 6:
                return "fas fa-sort-numeric-up";
            default:
                return "fas";
        }
    }

    // ------------------------------------------------- //
    //                MAIN SETUP FUNCTION                //
    // ------------------------------------------------- //
    setup(tableId) {
        // link icons for sort buttons
        var iconLink = document.createElement("link");
        iconLink.setAttribute("rel", "stylesheet");
        iconLink.setAttribute("href", "https://use.fontawesome.com/releases/v5.7.0/css/all.css");
        iconLink.setAttribute("integrity", "sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ");
        iconLink.setAttribute("crossorigin", "anonymous");
        document.head.appendChild(iconLink);

        // check arguments
        for (var i = 1; i < arguments.length; i++) {
            if ((arguments[i] != STRCOL) && (arguments[i] != NUMCOL)) {
                console.error("Dynamic table: Invalid arguments.");
                return;
            }
        }

        // check if <tbody> element is present
        var tmp = document.getElementById(tableId).getElementsByTagName("tbody");
        if (tmp.length < 1) {
            console.error("Dynamic table: No <tbody> element inside table.");
            return;
        }
        this.tbody = tmp[0];

        // get rows from <tbody>
        this.rows = [];
        var trElements = this.tbody.getElementsByTagName("tr");
        for (var i = 0; i < trElements.length; i++) {
            this.rows.push(new TableRow(trElements[i]));
        }
        if (this.rows.length < 1) {
            console.error("Dynamic table: No rows inside <tbody> element.");
            return;
        }

        // set up filter and order variables
        this.numCols = this.rows[0].cells.length;
        this.filters = [];
        for (var i = 0; i < this.numCols; i++) {
            this.filters[i] = "";
        }
        this.orders = [];
        for (var i = 0; i < this.numCols; i++) {
            this.orders[i] = 0;
        }

        // SET UP THE FILTER BAR
        this.filterBar = document.createElement("tr");
        for (var i = 0; i < this.numCols; i++) {
            // set up filter <input> element
            var filterInput = document.createElement("input");
            filterInput.setAttribute("type", "text");
            filterInput.setAttribute("class", "dyntable_filter");
            filterInput.setAttribute("placeholder", "Filter...");
            filterInput.oninput = this.setFilter.bind(this, i);

            // create wrapping cell and appednd it to filter bar
            var cellElement = document.createElement("td");
            cellElement.appendChild(filterInput);
            cellElement.setAttribute("class", "dyntable_cell");
            this.filterBar.appendChild(cellElement);
        }

        // SET UP THE SORT BAR
        this.sortBar = document.createElement("tr");
        for (var i = 0; i < this.numCols; i++) {
            // create wrapping cell (will contain 3 sorting buttons)
            var cellElement = document.createElement("td");
            cellElement.setAttribute("class", "dyntable_cell");

            for (var j = 0; j < 3; j++) {
                // create the <button> element and an icon for it
                var sortButton = document.createElement("button");
                sortButton.setAttribute("class", "dyntable_sort");
                var icon = document.createElement("i");

                // set the behaviour of the button and corresponding icon
                if (arguments.length > i + 1) {
                    sortButton.onclick = this.setOrder.bind(this, i, j * arguments[i + 1]);
                    icon.setAttribute("class", this.getIconClass(j * arguments[i + 1]));
                }
                else {
                    sortButton.onclick = this.setOrder.bind(this, i, j);
                    icon.setAttribute("class", this.getIconClass(j));
                }

                // put the icon on the button and append it in the wrapping cell
                sortButton.appendChild(icon);
                cellElement.appendChild(sortButton);
            }

            // append the cell to the sort bar
            this.sortBar.appendChild(cellElement);
        }

        // add filter and sort bars to the table
        tmp = document.getElementById(tableId).getElementsByTagName("thead");
        if (tmp.length < 1) {
            document.getElementById(tableId).insertBefore(this.sortBar, document.getElementById(tableId).childNodes[0]);
            document.getElementById(tableId).insertBefore(this.filterBar, document.getElementById(tableId).childNodes[0]);
        }
        else {
            tmp[0].appendChild(this.filterBar);
            tmp[0].appendChild(this.sortBar);
        }
    }

    // ------------------------------------------------- //
    //                    CONSTRUCTOR                    //
    // ------------------------------------------------- //
    constructor(tableId) {
        // wait until the DOM is loaded, then proceed
        document.addEventListener('DOMContentLoaded', (event) => {
            this.setup(tableId);
        });
    }
}
