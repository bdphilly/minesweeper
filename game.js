(function(root) {
  var Minesweeper = root.Minesweeper = (root.Minesweeper || {});

  var Game = Minesweeper.Game = function Game(width, totalBombs) {
    this.width = width;
    this.totalBombs = totalBombs;
    this.board = new Minesweeper.Board(width, totalBombs);
    this.flags = totalBombs;
    this.timer = 0;

    this.updateFlags();
    this.updateTimer();
    $('#smiley').removeClass();
    $('#smiley').addClass('normalFace');
    this.setupBoardSize();

    killIntervals();
  };

  Game.prototype.setupBoardSize = function () {
    if (this.width === 9) {
      $('#board').css('width', 144)
      $('#board').css('height', 144)
      $('#game').css('width', 156)
      $('#navbar').css('width', 146)
    } else {
      $('#board').css('width', 480)
      $('#board').css('height', 255)
      $('#game').css('width', 496)
      $('#navbar').css('width', 484)
    }
  };

  Game.prototype.render = function (totalBombs) {
    $("#board").empty();
    var tiles = this.board.tiles;
    var that = this;
    var newRenderedBoard = "";

    _.each(this.board.tiles, function (tile) {
      if (tile.revealed && tiles[tile.id].neighborBombCount() === 0) {
        newRenderedBoard += "<div class='tile revealed-0' data-id=" + tile.id + "></div>"
      } else if (tile.revealed) {
        newRenderedBoard += "<div class='tile revealed-" + tiles[tile.id].neighborBombCount() + "' data-id=" + tile.id + "></div>";
      } else if (tile.flagged) {
        newRenderedBoard += "<div class='tile flagged' data-id=" + tile.id + "></div>";
      } else {
        newRenderedBoard += "<div class='tile concealed' data-id=" + tile.id + "></div>"
      }
    });

    $('#board').append(newRenderedBoard);  

    if (that.isWon()) {
      killIntervals();
      $('#smiley').addClass('winFace')
    }

    this.bindKeyHandlers();
  };

  Game.prototype.renderLost = function (id) {
    _.each(this.board.tiles, function (tile) {
      if (tile.hasBomb) {
        $("[data-id=" + tile.id + "]").removeClass("concealed");
        $("[data-id=" + tile.id + "]").addClass("bomb"); 
      }
    })
    $("[data-id=" + id + "]").addClass("activatedBomb");
    $('#smiley').addClass('loseFace');
  };

  Game.prototype.bindKeyHandlers = function () {
    var tiles = this.board.tiles;
    var that = this;

    $('.tile').bind('contextmenu', function (event) {
      event.preventDefault();
      var id = $(event.currentTarget).data("id");
      tiles[id].setFlag();
      if (tiles[id].flagged) {
        that.flags -= 1;
      } else {
        that.flags += 1;
      }
      that.updateFlags();
      that.render();
    });

    $('.tile').click(function () {
      if (that.timer === 0) {
        that.startTimer();
      }

      var id = $(event.currentTarget).data("id");
      tiles[id].reveal();
      if (tiles[id].flagged) {

      } else if (tiles[id].hasBomb) {
        that.renderLost(id);
        killIntervals();
      } else {
        that.render();
      }
    });

    $('.tile').mousedown(function (event) {      
      if (event.button === 0) {
        $('#smiley').addClass('mouseClickFace');
      }
    });
    
    $('.tile').mouseup(function (event) {
        $('#smiley').removeClass('mouseClickFace');
    });

    $('#smiley').mousedown(function () {
      $('#smiley').addClass('otherFace');
    });

  };

  Game.prototype.isWon = function () {
    var unrevealed = 0;
    var correct_flags = 0;
    var that = this;

    _.each(this.board.tiles, function (tile) {
      if (tile.flagged && tile.hasBomb) {
        correct_flags += 1;
      }
      if (!(tile.revealed || tile.flagged)) {
        unrevealed += 1;
      }
    });
    return (correct_flags === that.totalBombs && unrevealed === 0);
  };

  Game.prototype.updateFlags = function () {
    numHash = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };
    left = numHash[Math.floor(this.flags / 10)]
    right = numHash[this.flags % 10]
    $('#flags').html(
      '<div class="flag zero"></div>' +
      '<div class="flag ' + left + '"></div>' +
      '<div class="flag ' + right + '"></div>'
    );
  };

  Game.prototype.updateTimer = function () {
    numHash = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };
    if (this.timer <= 999) { 
      timer = ("000" + this.timer).slice(-3); 
    }

    left = parseInt(timer[0]);
    center = parseInt(timer[1]);
    right = parseInt(timer[2]);

    $('#timer').html(
      '<div class="time-component ' + numHash[left] + '""></div>' +
      '<div class="time-component ' + numHash[center] + '"></div>' +
      '<div class="time-component ' + numHash[right] + '"></div>'
    );
  };

  Game.prototype.startTimer = function () {
    var that = this;
    killIntervals();
    var timerInterval = setInterval(function () {
      that.timer += 1;
      that.updateTimer();
    }, 1000);
    intervalArray.push(timerInterval);
  };
})(this);