package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
)

type level struct {
	count  int
	radius int
	colors int
	seed   int
}

var levels = [...]level{
	level{count: 5, radius: 4, colors: 2},
	level{count: 10, radius: 4, colors: 3},
	level{count: 10, radius: 5, colors: 3},
	// level{count: 10, radius: 6, colors: 3},
	// level{count: 10, radius: 7, colors: 3},
}

func main() {
	var b bytes.Buffer
	b.WriteString("[")
	for levelsIndex, l := range levels {
		for i := 0; i < l.count; i++ {
			l.seed = i + l.count*l.radius*l.colors
			b.WriteString("{")
			b.WriteString(fmt.Sprintf(`"radius":%d,`, l.radius))
			b.WriteString(fmt.Sprintf(`"seed":%d,`, l.seed))
			solution := solve(l)
			b.WriteString(`"colors":[`)
			for colorIndex, color := range solution.colors {
				if colorIndex+1 == len(solution.colors) {
					b.WriteString(fmt.Sprintf("%d", color))
				} else {
					b.WriteString(fmt.Sprintf("%d,", color))
				}
			}
			b.WriteString(fmt.Sprintf(`],"minimum":%d,"blocks":[`, solution.minimum))
			for index, color := range solution.moon.blocks {
				if index+1 == len(solution.moon.blocks) {
					b.WriteString(fmt.Sprintf("%d", color+1))
				} else {
					b.WriteString(fmt.Sprintf("%d,", color+1))
				}
			}
			if levelsIndex+1 == len(levels) && i+1 == l.count {
				b.WriteString("]}")
			} else {
				b.WriteString("]},")
			}
		}
	}
	b.WriteString("]")
	ioutil.WriteFile("../code/shoot/shoot.json", b.Bytes(), 0644)
}
