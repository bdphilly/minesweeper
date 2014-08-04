(function(root) {
  var Minesweeper = root.Minesweeper = (root.Minesweeper || {});

  var Tile = Minesweeper.Tile = function Tile(id, pos, board) {
    this.hasBomb = false;
    this.revealed = false;
    this.flagged = false;
    this.pos = pos;
    this.board = board;
    this.id = id;
  };

  Tile.prototype.setBomb = function () {
    this.hasBomb = true
  };

  Tile.prototype.setFlag = function () {
    if (this.flagged === true) {
      this.flagged = false;
    } else {
      this.flagged = true;
    }
  };

  Tile.prototype.neighbors = function () {
    var possibleNeighbors = [[1,1], [1,0], [0,1], [-1,1], [-1,-1], [1,-1], [-1,0], [0,-1]];
    neighbors = [];
    var width = this.board.width;
    var height = (width === 30) ? 16 : 9
    var that = this;

    _.each(possibleNeighbors, function (neighbor) {
      var row = that.pos[0] + neighbor[0];
      var col = that.pos[1] + neighbor[1];

      if (!(row > height - 1 || row < 0 || col > width - 1 || col < 0)) {
        neighbors.push(that.board.grid[row][col]);
      }
    })
    return neighbors;
  };

  Tile.prototype.neighborBombCount = function () {
    var bombs = 0;
    _.each(this.neighbors(), function (neighbor) {
      if (neighbor.hasBomb) { bombs += 1 }
    })
    return bombs;
  };  

  Tile.prototype.reveal = function () {
    if (this.flagged) return;

    this.revealed = true;
    if (this.neighborBombCount() === 0) {
      _.each(this.neighbors(), function (neighbor) {
        if (!neighbor.revealed || neighbor.flagged) {
          neighbor.reveal();
        }
      });
    }
  };

})(this);