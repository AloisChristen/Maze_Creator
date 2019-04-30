// Declaration and setup
VUE = {
    ctx: document.getElementById("CANVAS").getContext('2d'),
    size_w: 600,
    size_h: 600,
    cell_w: 0,
    cell_h: 0,
}

VUE.setup = function () {
    VUE.clear();
    VUE.size_w = MODEL.size_w;
    VUE.size_h = MODEL.size_h;
    VUE.ctx = document.getElementById('CANVAS').getContext('2d'),
    VUE.cell_w = VUE.size_w / MODEL.cell_cols;
    VUE.cell_h = VUE.size_h / MODEL.cell_rows;
}
VUE.clear = function () {
    VUE.ctx.fillStyle = "rbga(255,255,255,1)";
    VUE.ctx.clearRect(0,0,VUE.size_w,VUE.size_h);
}

VUE.drawGrid = function () {
    VUE.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    let currentWalls;
    VUE.ctx.beginPath();
    for(let c = 0; c < MODEL.cell_cols; c++){
        VUE.ctx.moveTo(c * VUE.cell_w, 0);
        VUE.ctx.lineTo(c * VUE.cell_w, VUE.size_h);
    }
    for(let r = 0; r < MODEL.cell_rows; r++){
        VUE.ctx.moveTo(0, r * VUE.cell_h);
        VUE.ctx.lineTo(VUE.size_w, r * VUE.cell_h);

    }
    VUE.ctx.stroke();
}
VUE.drawWalls = function () {
    VUE.ctx.strokeStyle = 'rgba(255,0,255,100)';
    VUE.ctx.beginPath();
    for(let c = 0; c < MODEL.cell_cols; c++){
        for(let r = 0; r < MODEL.cell_rows; r++){
            MODEL.cells[c][r].drawWalls();
        }
    }
    VUE.ctx.stroke();
}
VUE.drawCells = function () {
    VUE.ctx.fillStyle = "rgba(0,255,255,0.5)";
    let cell
    for(let c = 0; c < MODEL.cell_cols; c++){
        for(let r = 0; r < MODEL.cell_rows; r++){
            cell = MODEL.cells[c][r];
            if (cell.checked){
                VUE.ctx.fillRect(c*VUE.cell_w, r*VUE.cell_h,
                        VUE.cell_w, VUE.cell_h);
            }
        }
    }
    cell = MODEL.dsf.current;
    VUE.ctx.fillStyle = "rbga(0,255,255,100)";
    VUE.ctx.fillRect(cell.x * VUE.cell_w, cell.y * VUE.cell_h,
                     VUE.cell_w, VUE.cell_h);
}
MODEL = {
    size_w: 600,
    size_h: 600,
    cell_rows: 40,
    cell_cols: 100,
    cells: [],
    calculating: false,
    dsf: {},
}

MODEL.setup = function () {
    this.cells = [];
    let nextCell
    for(let col = 0; col < this.cell_cols; col++){
        let newRow = [];
        this.cells.push(newRow);
        for(let row = 0; row < this.cell_rows; row++){
            nextCell = new CELL(col, row);
            newRow.push(nextCell);
            if(col > 0){
                let leftCell = this.cells[col - 1][row];
                leftCell.neightboor.push(nextCell);
                nextCell.neightboor.push(leftCell);
            }
            if(row > 0){
                let topCell = this.cells[col][row - 1];
                topCell.neightboor.push(nextCell);
                nextCell.neightboor.push(topCell);
            }
        }
    }
    let x_rand = Math.floor(Math.random() * this.cell_cols);
    let y_rand = Math.floor(Math.random() * this.cell_rows);
    this.startCell = this.cells[x_rand][y_rand];
    this.endCell = this.cells[this.cell_cols-1][this.cell_rows-1];
}

function CELL(_x, _y){
    this.x = _x;
    this.y = _y;
    this.checked = false;
    this.neightboor = [];
    this.walls = [true, true, true, true];
}

CELL.prototype.getFreeNeightboor = function() {
    let listOfFree = [];
    this.neightboor.forEach(function(element){
        if (!element.checked || Math.random() < 0.01){
            listOfFree.push(element);
        }
    })
    return listOfFree;
};

CELL.prototype.setNeightboor = function(list) {
    this.neightboor = list;
};

CELL.prototype.drawWalls = function() {
    if(this.walls[0]){
        VUE.ctx.moveTo(
            this.x      * VUE.cell_w, 
            this.y      * VUE.cell_h);
        VUE.ctx.lineTo(
            (this.x + 1)* VUE.cell_w,
            this.y      * VUE.cell_h);
    }
    if(this.walls[1]){
        VUE.ctx.moveTo(
            (this.x + 1)* VUE.cell_w, 
            this.y      * VUE.cell_h);
        VUE.ctx.lineTo(
            (this.x + 1)* VUE.cell_w,
            (this.y + 1)* VUE.cell_h);
    }
    if(this.walls[2]){
        VUE.ctx.moveTo(
            (this.x + 1)* VUE.cell_w, 
            (this.y + 1)* VUE.cell_h);
        VUE.ctx.lineTo(
            this.x      * VUE.cell_w,
            (this.y + 1)* VUE.cell_h);
    }
    if(this.walls[3]){
        VUE.ctx.moveTo(
            this.x      * VUE.cell_w, 
            (this.y + 1)* VUE.cell_h);
        VUE.ctx.lineTo(
            this.x      * VUE.cell_w,
            this.y      * VUE.cell_h);
    }
}


// Algorithm for deep search first
MODEL.create_dsf = function (nb_steps) {
    MODEL.dsf.current = MODEL.startCell;
    MODEL.dsf.current.checked = true;
    MODEL.dsf.stack = [MODEL.dsf.current];
    MODEL.dsf.loop = setInterval(function () {
        let stack = MODEL.dsf.stack;
        let current = MODEL.dsf.current;
        let next;
        for(let step = 0; step < nb_steps; step++){
        if(stack.length > 0){
            let listOfNext = current.getFreeNeightboor();
            if(listOfNext.length > 0){
                let rand = Math.floor(Math.random() *
                           listOfNext.length);
                next = listOfNext[rand];
                let d_x = current.x - next.x;
                let d_y = current.y - next.y;
                if(d_x != 0){
                    next.walls[2 - d_x]    = false;
                    current.walls[2 + d_x] = false;
                } else {
                    next.walls[1 + d_y]    = false;
                    current.walls[1 - d_y] = false;
                }
                current = next;
                current.checked = true;
                stack.push(current);
            } else if (Math.random() >= 0.5){
                step--;
                current = stack.shift();
            } else {
                step--;
                current = stack.pop();
            }
            MODEL.dsf.current = current;
        } else {
            clearInterval(MODEL.dsf.loop);
            console.log("Cleared loop dsf");
        }
        }
        VUE.clear();
        VUE.drawCells();
        VUE.drawWalls();
    }, 30);
}
// SETUP
MODEL.setup();
VUE.setup();
// WORK
MODEL.create_dsf(100);
VUE.drawGrid();
