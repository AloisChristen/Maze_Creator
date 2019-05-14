// Declaration and setup
VUE = {
    ctx: document.getElementById("CANVAS").getContext('2d'),
    size_w: 600,
    size_h: 600,
    cell_w: 0,
    cell_h: 0,
    colors: {},
}

VUE.setup = function () {
    VUE.clear();
    VUE.size_w = MODEL.size_w;
    VUE.size_h = MODEL.size_h;
    VUE.ctx = document.getElementById('CANVAS').getContext('2d'),
    VUE.cell_w = VUE.size_w / MODEL.cell_cols;
    VUE.cell_h = VUE.size_h / MODEL.cell_rows;
    VUE.colors = {
        NOTHING: 'rgba(255,255,255,1)',
        WALL: 'rgba(255,0,255,1)',
        CHECKED: 'rgba(0,255,255,0.5)',
        CURRENT: 'rgba(0,255,255,1)',
        GRID: 'rgba(0,0,0,0.2)',
        PATH: 'rgba(0,60,160,1)',
    };
}
VUE.clear = function () {
    VUE.ctx.fillStyle = VUE.colors.NOTHING; 
    VUE.ctx.clearRect(0,0,VUE.size_w,VUE.size_h);
}

VUE.drawGrid = function () {
    VUE.ctx.strokeStyle = VUE.colors.GRID; 
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
    VUE.ctx.strokeStyle = VUE.colors.WALL; 
    VUE.ctx.beginPath();
    for(let c = 0; c < MODEL.cell_cols; c++){
        for(let r = 0; r < MODEL.cell_rows; r++){
            MODEL.cells[c][r].drawWalls();
        }
    }
    VUE.ctx.stroke();
}
VUE.drawCells = function () {
    VUE.ctx.fillStyle = VUE.colors.CHECKED; 
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
    VUE.ctx.fillStyle = VUE.colors.CURRENT; 
    VUE.ctx.fillRect(cell.x * VUE.cell_w, cell.y * VUE.cell_h,
                     VUE.cell_w, VUE.cell_h);
}
VUE.drawPath = function (path) {
    let w = VUE.cell_w / 2;
    let h = VUE.cell_h / 2;
    VUE.ctx.strokeStyle = VUE.colors.PATH;
    VUE.ctx.lineWidth = VUE.cell_w * 0.6;
    VUE.ctx.beginPath();
    VUE.ctx.moveTo(path[0].x + w, path[0].y + h);
    path.forEach(function(cell){
        VUE.ctx.lineTo(cell.x * VUE.cell_w + w, cell.y * VUE.cell_h + h);
    });
    VUE.ctx.stroke();
    VUE.ctx.lineWidth = 1;
}

MODEL = {
    size_w: 600,
    size_h: 600,
    cell_rows: 40,
    cell_cols: 40,
    cells: [],
    calculating: false,
    dsf: {},
    bfs : {},
}

MODEL.setup = function () {
    this.cells = [];
    this.cell_rows = CONTROL.rows.value;
    this.cell_cols = CONTROL.cols.value;
    this.creationSpeed = CONTROL.creationSpeed.value;

    let nextCell
    for(let col = 0; col < this.cell_cols; col++){
        let newRow = [];
        this.cells.push(newRow);
        for(let row = 0; row < this.cell_rows; row++){
            nextCell = new CELL(col, row);
            newRow.push(nextCell);
            if(col > 0){
                let leftCell = this.cells[col - 1][row];
                leftCell.neightboor[1] = nextCell;
                nextCell.neightboor[3] = leftCell;
            } else {
                nextCell.neightboor[3] = null;
            }
            if(row > 0){
                let topCell = this.cells[col][row - 1];
                topCell.neightboor[2] = nextCell;
                nextCell.neightboor[0] = topCell;
            } else {
                nextCell.neightboor[0] = null;
            }
        }
    }
    let x_rand = Math.floor(Math.random() * this.cell_cols);
    let y_rand = Math.floor(Math.random() * this.cell_rows);
    this.startCell = this.cells[0][0];
    this.endCell = this.cells[this.cell_cols-1][this.cell_rows-1];
    if(this.dsf.loop){
        clearInterval(this.dsf.loop);
    }
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
        if (element != null && (!element.checked || Math.random() < 0.0005)){
            listOfFree.push(element);
        }
    })
    return listOfFree;
};

CELL.prototype.getConnectedNeightboor = function() {
    let listOfFree = [];
    for(let i = 0; i < this.neightboor.length; i++){
        if (this.neightboor[i] != null && !this.walls[i]){
            listOfFree.push(this.neightboor[i]);
        }
    }
    return listOfFree;
}

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

CONTROL = {
    area: document.getElementById("CONTROL"),
}
CONTROL.setup = function () {
    this.create = document.createElement('button');
    this.area.appendChild(this.create);
    this.create.innerHTML = 'Create';
    this.create.onclick = function(){
        MODEL.setup();
        VUE.setup();
        MODEL.create_dsf(MODEL.creationSpeed);
    };
    this.rows = document.getElementById("rows");
    this.cols = document.getElementById("cols");
    this.creationSpeed = document.getElementById("creationSpeed");
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
        let loopClear = false;
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
            } else if (Math.random() >= 1){
                step--;
                current = stack.shift();
            } else {
                step--;
                current = stack.pop();
            }
            MODEL.dsf.current = current;
        } else {
            loopClear = true;
        }
        }
        VUE.clear();
        VUE.drawCells();
        VUE.drawWalls();
        if(loopClear){
            clearInterval(MODEL.dsf.loop);
            MODEL.solve_bfs(0);
        }
    }, 30);
}

//Algorithm to solve maze
MODEL.solve_bfs = function(nbsteps) {
    MODEL.bfs.current = MODEL.startCell;
    MODEL.bfs.queue = [MODEL.bfs.current];
    let path = [];
    let current = MODEL.bfs.current;
    let queue = MODEL.bfs.queue;
    current.discovered = true;
    while(queue.length > 0){
        current = queue.shift();
        if(current === MODEL.endCell){
            path.unshift(current);
            while(current.parentNode != null){
                current = current.parentNode;
                path.unshift(current);
            }
            break;
        }
        
        let nextNodes = current.getConnectedNeightboor();
        nextNodes.forEach(function(node){ 
            if(!(node.discovered === true)){
                node.discovered = true;
                node.parentNode = current;
                queue.push(node);
            }
        });
    }
    VUE.drawPath(path);
    VUE.drawWalls();
    //MODEL.bfs.loop = setInterval(function(){}, 30);


}
// SETUP
CONTROL.setup();
MODEL.setup();
VUE.setup();
// WORK
VUE.drawGrid();
