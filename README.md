# Cellular Automata and Conway's "Game of Life"
## Deployed App
---
[Game of Life ](https://game-of-life-ea.netlify.app/)
---
#### About
---

Welcome to John Conway's "Game of Life"! This is a computer science
classic from 1970, a program that simulates a _cellular automaton_
(plural _automata_). It has connections to all kinds of different
aspects of computer science and nature.

Over the course of this week, students will work on creating their own
application in which users will be able to run different "Game of Life"
scenarios. This module leads the reader through the fundamentals of
Conways's "Game of Life" and will guide them through the process of
creating an app utilizing tools and frameworks that have been taught
over the course of their specific track.

![example-patterns](https://media.giphy.com/media/4VVZTvTqzRR0BUwNIH/giphy.gif)

[from Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Examples_of_patterns)

#### Visualizing the "Game of Life"

The main entry point of your application should house the visualization
of this cellular automaton. Include necessary components, such as:

- Grid to display cells.
- Cell objects or components that, at a minimum, should have:
  - Properties
    - current state: (alive, dead), (black, white)
    - Clickable/Tappable:
      - can be clicked to allow user to setup initial cell configuration
      - should NOT be clickable while simulation is running
    - Behaviors
      - Toggle state functionality: switch between alive & dead either
        because user manually toggled cell before starting simulation or
        simulation is running and rules of life caused cell to change
        state
- An appropriate data structure to hold a grid of cells that is at least
  25x25. Go as big as you want.
- Text to display current generation # being displayed
  - Utilize a timeout function to build the next generation of cells &
    update the display at the chosen time interval
- Button(s) that start & stop the animation
- Button to clear the grid

Write an algorithm that:

- Implements the following basic steps:
  - For each cell in the current generation's grid:
    1. Examine state of all eight neighbors (it's up to you whether you
       want cells to wrap around the grid and consider cells on the
       other side or not)
    2. Apply rules of life to determine if this cell will change states
    3. When main loop completes:
       1. Swap current and next grids
       2. Repeat until simulation stopped
- Breaks down above steps into appropriate sub-tasks implemented with
  helper functions to improve readability
- Uses double buffering to update grid with next generation.
- Does something well-documented with the edge of the grid. (e.g. wrap
  around to the far side--most fun!--or assumes all edge cells are
  permanently dead.)

### Custom Features
- Responsive layout will generate board based on cell size and window width and heigth
- Option that creates a random cell configuration with that users can
  run (will stop simulation and reset generation count to 0)
- Option to resize cells (available while simulation is running)
- Option to allow user to specify the speed of the simulation
- Allows users to change the dimension of the grid being displayed (available while simulation is running)
- Simulation stops automatically when "solved" (no new cells and no change in number of cells)
- Simulation stops automatically when several hundred generations happen without a change in the number of cells run will resume

## Stretch Goals
- Add touch controls to allow mobile to zoom to control cellSize
- Write a how-to guide or blog post that walks readers through the
  work you did to implement your project
- Expand your simulation into the third dimension. Google `3D Conways Life`. Google for how to do 3D stuff on your platform. Web users might
  check out [3D-ThreeJS](https://github.com/LambdaSchool/3D-ThreeJS),
  and iOS might look at [SceneKit](https://developer.apple.com/scenekit/).
- Explore alternate algorithms for finding the nth generation, such
  as [Hashlife](https://en.wikipedia.org/wiki/Hashlife)

