package main

import (
	"fmt"
	"math"
	"math/rand"
	"sort"
	"strconv"
	"time"
)

type board struct {
	blocks     []int
	moves      int
	count      int
	difficulty int
}

var seed int
var radius int
var colors int
var size int
var minimum int = -1
var tested int = 0
var colorList []int
var difficulty int
var params parameters
var failed bool

func createBoard() *board {
	var moon board
	moon.blocks = make([]int, size*size)
	return &moon
}

// func randomFloat() float64 {
// 	n := math.Sin(float64(seed)) * 10000
// 	seed++
// 	return n - math.Floor(n)
// }

// func randomInt(n int) int {
// 	var negative int
// 	if n < 0 {
// 		negative = -1
// 	} else {
// 		negative = 1
// 	}
// 	n *= negative
// 	result := math.Floor(randomFloat() * float64(n))
// 	return int(result) * negative
// }

func makeColors(n int) []int {
	colorList = make([]int, n)
	for i := 0; i < n; i++ {
		colorList[i] = rand.Intn(0xffffff)
	}
	return colorList
}

func moonData() *board {
	moon := createBoard()
	makeColors(colors)
	radiusSquared := radius * radius
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			dx := x - radius
			dy := y - radius
			distanceSquared := dx*dx + dy*dy
			if distanceSquared <= radiusSquared {
				color := rand.Intn(colors)
				moon.blocks[x+y*size] = color
				moon.count++
			} else {
				moon.blocks[x+y*size] = -1
			}
		}
	}
	return moon

}

func draw(data *board) {
	var line string
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			color := data.blocks[x+y*size]
			if color == -1 {
				line += " "
			} else {
				line += strconv.Itoa(color)
			}
		}
		fmt.Println(line)
		line = ""
	}
}

type solved struct {
	seed       int
	minimum    int
	moon       *board
	colors     []int
	difficulty int
}

func seedExists(s shootJSON) bool {
	for _, shoot := range s {
		if shoot.Seed == seed {
			return true
		}
	}
	return false
}

func simpleSeed() {
	nano := time.Now().UnixNano()
	seedString := fmt.Sprintf("%d", nano)
	seed, _ = strconv.Atoi(seedString[len(seedString)-6:])
	rand.Seed(int64(seed))
}

func solver(p parameters, shoot shootJSON) *solved {
	params = p
	for {
		nano := time.Now().UnixNano()
		seedString := fmt.Sprintf("%d", nano)
		seed, _ = strconv.Atoi(seedString[len(seedString)-6:])
		if !seedExists(shoot) {
			break
		}
	}
	rand.Seed(int64(seed))
	minimum = 1000
	difficulty = 0
	radius = p.Radius
	size = radius*2 + 1
	colors = p.Colors
	data := moonData()
	iterate(data)
	if minimum != 1000 {
		s := solved{seed: seed, minimum: minimum, moon: data, colors: colorList, difficulty: difficulty}
		return &s
	}
	return nil
}

func cloneData(data *board) *board {
	clone := createBoard()
	for i := 0; i < len(data.blocks); i++ {
		clone.blocks[i] = data.blocks[i]
	}
	clone.count = data.count
	clone.moves = data.moves + 1
	clone.difficulty = data.difficulty
	tested++
	return clone
}

func inNeighbors(list []neighbor, x, y int) bool {
	for _, n := range list {
		if n.x == x && n.y == y {
			return true
		}
	}
	return false
}

func dir(data *board, x, y, deltaX, deltaY, color int, list, search []neighbor) ([]neighbor, []neighbor) {
	if x+deltaX >= 0 && x+deltaX < size && y+deltaY >= 0 && y+deltaY < size {
		check := data.blocks[x+deltaX+(y+deltaY)*size]
		if check != -1 && check == color && !inNeighbors(list, x+deltaX, y+deltaY) {
			list = append(list, neighbor{x + deltaX, y + deltaY})
			search = append(search, neighbor{x + deltaX, y + deltaY})
		}
	}
	return list, search
}

type neighbor struct {
	x int
	y int
}

func findNeighbors(data *board, x0, y0, color int) []neighbor {
	list := make([]neighbor, 0, 10)
	search := make([]neighbor, 0, 10)
	list = append(list, neighbor{x0, y0})
	search = append(search, neighbor{x0, y0})
	for len(search) != 0 {
		entry := search[0]
		search = search[1:]
		list, search = dir(data, entry.x, entry.y, 1, 0, color, list, search)
		list, search = dir(data, entry.x, entry.y, 0, 1, color, list, search)
		list, search = dir(data, entry.x, entry.y, 1, 1, color, list, search)
		list, search = dir(data, entry.x, entry.y, -1, 0, color, list, search)
		list, search = dir(data, entry.x, entry.y, 0, -1, color, list, search)
		list, search = dir(data, entry.x, entry.y, -1, -1, color, list, search)
		list, search = dir(data, entry.x, entry.y, 1, -1, color, list, search)
		list, search = dir(data, entry.x, entry.y, -1, 1, color, list, search)
	}
	return list
}

func inMoves(moves [][]neighbor, x, y int) bool {
	for _, move := range moves {
		for _, entry := range move {
			if entry.x == x && entry.y == y {
				return true
			}
		}
	}
	return false
}

type byNeighbors [][]neighbor

func (s byNeighbors) Len() int {
	return len(s)
}

func (s byNeighbors) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func (s byNeighbors) Less(i, j int) bool {
	return len(s[i]) > len(s[j])
}

func gather(data *board) [][]neighbor {
	moves := make([][]neighbor, 0, 10)
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			color := data.blocks[x+y*size]
			if color != -1 && !inMoves(moves, x, y) {
				moves = append(moves, findNeighbors(data, x, y, color))
			}
		}
	}
	sort.Sort(byNeighbors(moves))
	return moves
}

type movingType struct {
	x   int
	y   int
	xTo int
	yTo int
}

func inMovesTo(moving []movingType, xTo, yTo int) bool {
	for _, move := range moving {
		if move.xTo == xTo && move.yTo == yTo {
			return true
		}
	}
	return false
}

func compress(data *board) {
	next := true
	for next {
		moving := make([]movingType, 0, 10)
		for y := 0; y < size; y++ {
			for x := 0; x < size; x++ {
				color := data.blocks[x+y*size]
				if color != -1 && !(math.Abs(float64(x-radius)) < 1 && math.Abs(float64(y-radius)) < 1) {
					angle := math.Atan2(float64(radius-y), float64(radius-x))
					xTo := int(math.Round(float64(x) + math.Cos(angle)))
					yTo := int(math.Round(float64(y) + math.Sin(angle)))
					if data.blocks[int(xTo)+int(yTo)*size] == -1 && !inMovesTo(moving, xTo, yTo) {
						moving = append(moving, movingType{x, y, xTo, yTo})
					}
				}
			}
		}
		if len(moving) != 0 {
			for len(moving) != 0 {
				var move movingType
				move, moving = moving[len(moving)-1], moving[:len(moving)-1]
				data.blocks[move.xTo+move.yTo*size] = data.blocks[move.x+move.y*size]
				data.blocks[move.x+move.y*size] = -1
			}
			next = true
		} else {
			next = false
		}
	}
}

func clear(data *board, move []neighbor) {
	for _, neighbor := range move {
		data.blocks[neighbor.x+neighbor.y*size] = -1
	}
	data.count -= len(move)
}

func countColors(data *board, moves [][]neighbor) int {
	colors := make(map[int]bool)
	for _, move := range moves {
		colors[data.blocks[move[0].x+move[0].y*size]] = true
	}
	return len(colors)
}

func iterate(data *board) {
	moves := gather(data)
	if countColors(data, moves)+data.moves < minimum {
		for moveIndex, move := range moves {
			if failed {
				break
			}
			clone := cloneData(data)
			clone.difficulty += moveIndex
			clear(clone, move)
			compress(clone)
			if clone.count == 0 {
				if clone.moves <= minimum || (clone.moves == minimum && clone.difficulty > difficulty) {
					minimum = clone.moves
					difficulty = clone.difficulty
					// fmt.Println("New minimum: ", minimum)
					// fmt.Printf("\rMoves: %d, minimum %d", tested, minimum)
				}
			} else {
				if clone.moves < minimum {
					// fmt.Printf("\rMoves: %d, minimum %d", tested, minimum)
					iterate(clone)
				}
			}
		}
	}
}
