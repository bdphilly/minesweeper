(function(root) {
  var Minesweeper = root.Minesweeper = (root.Minesweeper || {});

  var Board = Minesweeper.Board = function Board (width, totalBombs) {
    this.tiles = [];
    this.width = width;
    this.grid = this.instantiateGrid(width);
    this.setBombs(totalBombs);
  };

  Board.prototype.instantiateGrid = function (width, pos) {
    var grid = [];
    var that = this;
    var id = 0;
    var height = (width === 30) ? 16 : 9
    _.times(height, function (row) {
      grid.push(new Array)
      
      _.times(width, function (col) {
        var newTile = new Minesweeper.Tile(id, [row, col], that);
        id += 1;
        grid[row].push(newTile);
        that.tiles.push(newTile);
      })
    })
    return grid;
  };

  Board.prototype.setBombs = function (totalBombs) {
    var that = this;
    _(totalBombs).times(function () {
      flag = true;
      while (flag) {
        var randTile = _.random(0, that.tiles.length - 1);
        if (!that.tiles[randTile].hasBomb) {
          that.tiles[randTile].setBomb();
          flag = false;
        }
      }
    })
  };
  
})(this);