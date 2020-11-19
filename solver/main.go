package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
)

type level struct {
	count  int
	radius int
	colors int
	seed   int
}

type parameters struct {
	Radius       int
	Colors       int
	Count        int
	MinMoves     int
	MaxMoves     int
	MinDiff      int
	MaxDiff      int
	Delete       string
	ChangeColors string
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

func (s shootJSON) Less(i, j int) bool {
	if len(s[i].Colors) < len(s[j].Colors) {
		return true
	}
	if len(s[i].Colors) > len(s[j].Colors) {
		return false
	}
	if s[i].Radius < s[j].Radius {
		return true
	}
	if s[i].Radius > s[j].Radius {
		return false
	}
	if s[i].Difficulty < s[j].Difficulty {
		return true
	} else if s[i].Minimum < s[j].Minimum {
		return true
	}
	return false
}

var maxTries = 1000

func main() {
	args := parameters{
		Radius:       6,
		Colors:       3,
		Count:        3,
		MinMoves:     4,
		MaxMoves:     10,
		MinDiff:      6,
		MaxDiff:      10,
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
	bytes, _ := json.Marshal(&levels)
	ioutil.WriteFile("../code/shoot/shoot.json", bytes, 0644)
}
