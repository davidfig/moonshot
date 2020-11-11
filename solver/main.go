package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"sort"
	"strconv"
	"strings"
)

type level struct {
	count  int
	radius int
	colors int
	seed   int
}

// var levels = [...]level{
// 	level{count: 5, radius: 4, colors: 2},
// 	level{count: 10, radius: 4, colors: 3},
// 	level{count: 10, radius: 5, colors: 3},
// 	level{count: 10, radius: 6, colors: 3},
// 	level{count: 10, radius: 7, colors: 3},
// }

type parameters struct {
	Radius       int    `arg:"required"`
	Colors       int    `arg:"required"`
	Count        int    `arg:"--count" default:1`
	MinMoves     int    `arg:"--minMoves" help:"Minimum Moves" default:-1`
	MaxMoves     int    `arg:"--maxMoves" help:"Maximum Moves" default:10000`
	MinDiff      int    `arg:"--minDiff" help:"Minimum Difficulty" default:-1`
	MaxDiff      int    `arg:"--maxDiff" help:"Maximum Difficulty" default:10000`
	Delete       string `arg:"--delete" help:"--delete <seed>-<radius>"`
	ChangeColors string `arg:"--delete" help:"--changecolors <seed>-<radius>"`
}

type shoot struct {
	Radius     int
	Seed       int
	Colors     []int
	Difficulty int
	Minimum    int
	Blocks     []int
}

type shootJSON []shoot

func (s shootJSON) Len() int {
	return len(s)
}

func (s shootJSON) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func (s shootJSON) Less(i, j int) bool {
	if s[i].Radius < s[j].Radius {
		return true
	} else if s[i].Radius > s[j].Radius {
		return false
	} else {
		if s[i].Difficulty < s[j].Difficulty {
			return true
		} else if s[i].Minimum < s[j].Minimum {
			return true
		}
	}
	return false
}

var maxTries = 1000

func main() {
	args := parameters{
		Radius:       5,
		Colors:       3,
		Count:        5,
		MinMoves:     3,
		MaxMoves:     5,
		MinDiff:      2,
		MaxDiff:      5,
		Delete:       "",
		ChangeColors: "",
	}
	// arg.MustParse(&args)
	levels := make(shootJSON, 0, 0)
	file, _ := os.Open("../code/shoot/shoot.json")
	jsonFile, _ := ioutil.ReadAll(file)
	json.Unmarshal(jsonFile, &levels)
	if args.Delete != "" {
		split := strings.Split(args.Delete, "-")
		seed, _ := strconv.Atoi(split[0])
		radius, _ := strconv.Atoi(split[1])
		found := false
		for index, level := range levels {
			if level.Seed == seed && level.Radius == radius {
				levels = append(levels[:index], levels[index+1:]...)
				fmt.Println("\nRemoving level seed=", level.Seed, " radius=", level.Radius)
				found = true
				break
			}
		}
		if !found {
			fmt.Println("\nFailed to remove", args.Delete)
		}
	} else if args.ChangeColors != "" {
		split := strings.Split(args.ChangeColors, "-")
		seed, _ := strconv.Atoi(split[0])
		radius, _ := strconv.Atoi(split[1])
		found := false
		for index, level := range levels {
			if level.Seed == seed && level.Radius == radius {
				simpleSeed()
				levels[index].Colors = makeColors(len(level.Colors))
				fmt.Println("\nChanged colors for", args.ChangeColors)
				found = true
				break
			}
		}
		if !found {
			fmt.Println("\nFailed to change colors for", args.ChangeColors)
		}
	} else {
		fmt.Println("\nSearching for ", args.Count, " levels...")
		for i := 0; i < args.Count; i++ {
			skip := 0
			for {
				solution := solver(args, levels)
				if solution != nil &&
					solution.difficulty >= args.MinDiff && solution.difficulty <= args.MaxDiff &&
					solution.minimum >= args.MinMoves && solution.minimum <= args.MaxMoves {
					add := shoot{
						Radius:     args.Radius,
						Seed:       solution.seed,
						Colors:     solution.colors,
						Difficulty: solution.difficulty,
						Minimum:    solution.minimum,
						Blocks:     solution.moon.blocks,
					}
					fmt.Println("Adding level: min=", solution.minimum, " difficulty=", solution.difficulty)
					levels = append(levels, add)
					break
				} else {
					skip++
					if skip > maxTries {
						fmt.Println("Did not find level meeting parameters.")
						break
					}
				}
			}
		}
	}
	sort.Sort(levels)
	bytes, _ := json.Marshal(&levels)
	ioutil.WriteFile("../code/shoot/shoot.json", bytes, 0644)
}
