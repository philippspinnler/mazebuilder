var grid_size = 400;
var cell_size = 10;
var rows = grid_size/cell_size;
var cols = grid_size/cell_size;
var grid=[];
var start_x = 0;
var start_y = 0;
var current;
var path = [];
var building = false;
var solving = false;
var NEIGHBOR_TOP = 'top';
var NEIGHBOR_BOTTOM = 'bottom';
var NEIGHBOR_LEFT = 'left';
var NEIGHBOR_RIGHT = 'right';
var goal_x = cols-1;
var goal_y = rows-1;

function setup() {
    // +1 to show lines
    createCanvas(grid_size+1, grid_size+1);
    for (var x=0; x < cols; x++) {
        grid[x] = [];
        for (var y=0; y < rows; y++) {
            grid[x][y] = new Cell(cell_size*x, cell_size*y);
        }
    }

    frameRate(120);
}

function draw() {
    background(255);
    for (var x=0; x < grid.length; x++) {
        for (var y=0; y < grid[x].length; y++) {
            grid[x][y].show();
        }
    }

    if (building) Builder();
    if (solving) Solver();
}

function clean_before() {
    path = [];
    current = grid[start_x][start_y];
}

function clean_after() {
    // reset visited and walls
    for (var x=0; x < grid.length; x++) {
        for (var y=0; y < grid[x].length; y++) {
            grid[x][y].visited = false;
        }
    }
}

function build() {
    clean_before();
    building = true;
}

function solve() {
    clean_before();
    solving = true;
}

function Solver() {
    current.highlight();
    current.visitedSolved = true;
    var next = current.getRandomVisitableNeighbors();

    if (goal_x == current.x/cell_size && goal_y == current.y/cell_size) {
        solving = false;
        clean_after();
        return;
    }

    if (next) {
        path.push(current);
        next.visitedSolved = true;
        next.visited = true;
        current = next;
    } else {
        current.visitedSolved = false;
        current = path.pop();
    }
}

function Builder() {
    current.visited = true;
    current.highlight();
    var next = current.getRandomNeighbors();

    if (next) {
        path.push(current);
        current.removeLines(next);
        next.visited = true;
        current = next;
    } else {
        current = path.pop();
        if (start_x == current.x/cell_size && start_y == current.y/cell_size) {
            building = false;
            clean_after();
        }
    }
}

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.id = this.x + '_' + this.y;
    this.line_top = true;
    this.line_bottom = true;
    this.line_left = true;
    this.line_right = true;
    this.visited = false;
    this.visitedSolved = false;

    this.highlight = function() {
        noStroke();
        fill(0, 0, 255, 100);
        rect(this.x, this.y, cell_size, cell_size);
    };

    this.show = function() {
        stroke(0);
        if (this.line_top) line(this.x, this.y, this.x+cell_size, this.y);
        if (this.line_bottom) line(this.x, this.y+cell_size, this.x+cell_size, this.y+cell_size);
        if (this.line_left) line(this.x, this.y, this.x, this.y+cell_size);
        if (this.line_right) line(this.x+cell_size, this.y, this.x+cell_size, this.y+cell_size);

        if (this.visited) {
            noStroke();
            fill(255, 0, 255, 100);
            rect(this.x, this.y, cell_size, cell_size)
        }
        if (this.visitedSolved) {
            noStroke();
            fill(119, 255, 188, 100);
            rect(this.x, this.y, cell_size, cell_size)
        }
    };

    this.getNeighbor = function(which, x, y) {
        if (which === NEIGHBOR_TOP) return ('undefined' !== typeof grid[this.x/cell_size] && 'undefined' !== typeof grid[this.x/cell_size][this.y/cell_size-1]) ? grid[this.x/cell_size][this.y/cell_size-1] : false;
        if (which === NEIGHBOR_BOTTOM) return ('undefined' !== typeof grid[this.x/cell_size] && 'undefined' !== typeof grid[this.x/cell_size][this.y/cell_size+1]) ? grid[this.x/cell_size][this.y/cell_size+1] : false;
        if (which === NEIGHBOR_LEFT) return ('undefined' !== typeof grid[this.x/cell_size-1] && 'undefined' !== typeof grid[this.x/cell_size-1][this.y/cell_size]) ? grid[this.x/cell_size-1][this.y/cell_size] : false;
        if (which === NEIGHBOR_RIGHT) return ('undefined' !== typeof grid[this.x/cell_size+1] && 'undefined' !== typeof grid[this.x/cell_size+1][this.y/cell_size]) ? grid[this.x/cell_size+1][this.y/cell_size] : false;
    };

    this.getRandomVisitableNeighbors = function() {
        var neighbors = [];

        var neighbor_top = this.getNeighbor(NEIGHBOR_TOP);
        var neighbor_bottom = this.getNeighbor(NEIGHBOR_BOTTOM);
        var neighbor_left = this.getNeighbor(NEIGHBOR_LEFT);
        var neighbor_right = this.getNeighbor(NEIGHBOR_RIGHT);
        var last = (path.length>0) ? path[path.length-1] : false;

        if (!this.line_top && last.id != neighbor_top.id && !neighbor_top.visited) neighbors.push(neighbor_top);
        if (!this.line_bottom && last.id != neighbor_bottom.id && !neighbor_bottom.visited) neighbors.push(neighbor_bottom);
        if (!this.line_left && last.id != neighbor_left.id && !neighbor_left.visited) neighbors.push(neighbor_left);
        if (!this.line_right && last.id != neighbor_right.id && !neighbor_right.visited) neighbors.push(neighbor_right);

        if (neighbors.length === 0) return false;

        return neighbors[floor(random(0, neighbors.length))];
    };

    this.getRandomNeighbors = function () {
        var neighbors = [];

        var neighbor_top = this.getNeighbor(NEIGHBOR_TOP);
        var neighbor_bottom = this.getNeighbor(NEIGHBOR_BOTTOM);
        var neighbor_left = this.getNeighbor(NEIGHBOR_LEFT);
        var neighbor_right = this.getNeighbor(NEIGHBOR_RIGHT);

        if (neighbor_top && !neighbor_top.visited) neighbors.push(neighbor_top);
        if (neighbor_bottom && !neighbor_bottom.visited) neighbors.push(neighbor_bottom);
        if (neighbor_left && !neighbor_left.visited) neighbors.push(neighbor_left);
        if (neighbor_right && !neighbor_right.visited) neighbors.push(neighbor_right);

        if (neighbors.length === 0) return false;

        return neighbors[floor(random(0, neighbors.length))];
    };

    this.removeLines = function(next) {
        var current_x_index = this.x/cell_size;
        var current_y_index = this.y/cell_size;
        var next_x_index = next.x/cell_size;
        var next_y_index = next.y/cell_size;

        // next on top?
        if (current_x_index == next_x_index && current_y_index-1 == next_y_index) {
            this.line_top = false;
            next.line_bottom = false;
        }
        // next on bottom?
        if (current_x_index == next_x_index && current_y_index+1 == next_y_index) {
            this.line_bottom = false;
            next.line_top = false;
        }
        // next on left?
        if (current_x_index-1 == next_x_index && current_y_index == next_y_index) {
            this.line_left = false;
            next.line_right = false;
        }
        // next on right?
        if (current_x_index+1 == next_x_index && current_y_index == next_y_index) {
            this.line_right = false;
            next.line_left = false;
        }
    }
}