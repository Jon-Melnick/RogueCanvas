class Search
	def initialize
		@grid = new_grid
	end

	def new_grid

		grid = []
		5.times do
			row = []
			5.times do
				row << '.'
			end
			grid.push(row)
		end

		grid[4][4] = 'P'

		grid[2][3] = "M"

		5.times do |i|
			puts grid[i].join(' ')
		end

		grid
	end

	def move_creature(start_pos)
		stack = [start_pos]
		seen = {}
		prev_move = {}
		space = nil
		until stack.empty?
			pos = stack.shift
			seen[pos] = true
			moves(pos).each do |move|

				next if seen[move]
				if valid?(move)
					stack.push(move)
					prev_move[move] = pos
				end

				return calculate_path(start_pos, move, prev_move) if space(move) == "P"
			end
		end
		p prev_move
	end

	def space(move)
		@grid[move[0]][move[1]]
	end

	def moves(pos)
		tracks = [[0,1],[1,0],[-1,0],[0,-1]]
		moves = tracks.map do |track|
			track[0] += pos[0]
			track[1] += pos[1]
			track
		end
	end

	def valid?(move)
		move.all? do |el|
			el >= 0 && el < 10
		end
	end

	def calculate_path(start_pos, pos, prev_move)
		p prev_move
		result =  [pos]
		space = pos
		until space == start_pos
			p space
			space = prev_move[space]
		end
	end

end

x = Search.new

x.move_creature([2, 3])
