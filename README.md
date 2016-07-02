# p5js-burgebros-maptool
A tool to generate or edit maps for the BurgleBros board game, and assist in the subsequent "blind layout" of the map by players.  Implemented in p5js.

### Screenshot
 Here, we're placing a safe in the map editor, in an almost-complete map.
![Screenshot of map-editing](https://github.com/nbogie/p5js-burgebros-maptool/blob/master/screenshots/screenshot-map-editing.png)

###Controls

#### During map-editing:

    r: Randomly place all remaining tiles
    h: Toggle help
    c: Clear map
    v: Validate floors
    d: Toggle debug

    Click a tile place: Place the selected tile-type in that place.
    Shift-Click a tile: Remove the selected tile.

    Export Map: Export the map-in-progress to a serialised string for sharing.
    Import Map: Import the map from the string in the input field.

#### During tile-layout assistance

    .: Show previous tiles
    ,: Show next tiles to place
