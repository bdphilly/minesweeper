require 'yaml'

class Tile
  attr_reader :has_bomb, :tile_pos, :board, :flagged, :revealed
  def initialize(row,col,board)
    @has_bomb = false
    @revealed = false
    @flagged = false
    @tile_pos = [row,col]
    @board = board
  end

  def set_bomb
    @has_bomb = true
    #@state = " + "
  end

  def set_flag
    @flagged == true ? @flagged = false : @flagged = true
  end

  def to_s
    if @revealed
      if @has_bomb
        return " * "
      elsif self.neighbor_bomb_count > 0
        return " #{neighbor_bomb_count.to_s} "
      else
        return " = "
      end
    elsif @flagged
      return " \u2691 "
    else
      return " + "
    end
  end

  def reveal
    return if @flagged
    # p 'reveal'
    @revealed = true
    if self.neighbor_bomb_count == 0
      self.neighbors.each do |neighbor|
        neighbor.reveal if !neighbor.revealed || neighbor.flagged
      end
    end
  end


  def neighbors
    neighbors_array = []

    neighbors = [[1,1], [1,0], [0,1], [-1,1], [-1,-1], [1,-1], [-1,0], [0,-1]]

    neighbors.each do |neighbor|

      neighbor_pos_row = self.tile_pos.first + neighbor.first
      neighbor_pos_col = self.tile_pos.last + neighbor.last

      unless neighbor_pos_row > 8 || neighbor_pos_row < 0 || neighbor_pos_col > 8 || neighbor_pos_col < 0
        neighbors_array << self.board.get_board[neighbor_pos_row][neighbor_pos_col]
      end
    end
    neighbors_array
  end

  def neighbor_bomb_count
    self.neighbors.count { |neighbor| neighbor.has_bomb }
  end
end

class Board
  attr_accessor :board, :player, :num_bombs

  def initialize(num_bombs)
    @board = Array.new(9) { |row| Array.new (9) { |col| Tile.new(row,col, self) } }
    @num_bombs = num_bombs
    set_bombs(num_bombs)
    @player = Player.new
  end

  def run
    until game_over? || win?

      selection = player.get_choice

      if selection.join("") == "save"
        save_game
        puts "YOUR GAME WAS SAVED. GOODBYE!"
        abort
      elsif selection.join("") == 'load'
        load_game
        puts "YOUR GAME WAS LOADED. HELLO!  "
        sleep(2)
        # puts "press any key..."
 #        gets.chomp
      elsif selection.last == "f"
        @board[selection[1].to_i][selection[0].to_i].set_flag
      else
        @board[selection[1].to_i][selection[0].to_i].reveal
      end

      self.print_board unless game_over?
    end

    if win?
      self.print_winning_board
      puts "YOU WIN!"
    else
      self.print_losing_board
      puts "You lose!!!"
    end
  end

  def game_over?
    all_tiles = []

    9.times do |row|
      9.times do |col|
        all_tiles << @board[row][col]
      end
    end

    all_tiles.any? {|tile| tile.revealed && tile.has_bomb}

  end

  def win?
    unrevealed = []
    correct_flags = []

    9.times do |row|
      9.times do |col|
        curr_tile = @board[row][col]
        correct_flags << curr_tile if curr_tile.flagged && curr_tile.has_bomb
        unrevealed << curr_tile unless curr_tile.revealed || curr_tile.flagged
      end
    end
    correct_flags.count == @num_bombs && unrevealed.empty?
  end

  def get_board
    @board
  end

  def print_board
    puts "\e[H\e[2J"
    puts "   0  1  2  3  4  5  6  7  8"
    board_row = ""
    9.times do |row|
      9.times do |col|
        board_row << @board[row][col].to_s
      end
      puts "#{row} #{board_row}"
      board_row = ""
    end
    puts
  end

  def print_losing_board
    puts "\e[H\e[2J"
    board_row = ""
    9.times do |row|
      9.times do |col|
        if @board[row][col].has_bomb
          board_row << " \u06DD "
        else
          board_row << " X "
        end
      end
      puts board_row
      board_row = ""
    end
  end

  def print_winning_board
    puts "\e[H\e[2J"
    board_row = ""
    9.times do |row|
      9.times do |col|
        # if @board[row][col].has_bomb
          board_row << " \u263B "
        # else
          # board_row << @board[row][col].to_s
        # end
      end
      puts board_row
      board_row = ""
    end
  end

  def save_game
    game = self.to_yaml
    File.open('./ms.yaml', 'w') { |f| f.write(game) }
  end

  def load_game
    game = YAML.load(File.read('./ms.yaml'))

    @board = game.board
    @player = game.player
    @num_bombs = game.num_bombs
  end


  #U+06DD

  # flag: U+2691

# U+263A


  private

  def set_bombs(num_bombs)
    num_bombs.times do
      loop do
        row = rand(9)
        col = rand(9)

        if @board[row][col].has_bomb == false
          @board[row][col].set_bomb
          break
        end
      end
    end
  end
end

class Player
  def get_choice
      puts "Enter the tile you want to reveal: example: 0,1 "
      puts "Flag a tile by entering 0,1,f"
      puts "Save a game by entering 'save'"
      puts "Load a game by entering 'load'"
      gets.downcase.chomp.split(',')
  end
end

puts "How many bombs?"
bombs = gets.chomp.to_i
minesweeper = Board.new(bombs)
minesweeper.print_board
minesweeper.run