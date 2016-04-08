"use strict";
var bgColor = 0;
var showDebug = false;
var keepLooping = true;
var layoutOrderItems;

var Mode = {DESIGN: 1, STACK: 2, FOLLOW: 3};
var mode = Mode.DESIGN;

var firstTileNumToShow = 1;
var numTilesToShow = 6;


var layoutOrder = function() {
  return [
    "1a1", "2a1", "3a1",
    "1a2", "2a2", "3a2",
    "1a3", "2a3", "3a3",
    "1a4", "2a4", "3a4",
    "1b1", "2b1", "3b1",
    "1b2", "2b2", "3b2",
    "1b3", "2b3", "3b3",
    "1b4", "2b4", "3b4",
    "1c1", "2c1", "3c1",
    "1c2", "2c2", "3c2",
    "1c3", "2c3", "3c3",
    "1c4", "2c4", "3c4",
    "1d1", "2d1", "3d1",
    "1d2", "2d2", "3d2",
    "1d3", "2d3", "3d3",
    "1d4", "2d4", "3d4"
  ];
};

var orderer = (function() {

  var parse = function(str) {
    return {
      floor: parseInt(str.substring(0, 1)),
      row: 1 + parseInt(str.substring(1, 2).charCodeAt(0) - "a".charCodeAt(0)),
      col: parseInt(str.substring(2, 3))
    }
  };

  return {
    parseItemStrings: function(strs) {
      var items = [];
      for (var itemStr of strs) {
        var item = parse(itemStr);
        items.push(item);
      }
      return items;
    }
  }
})();

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(10);
  noLoop();
  restart();
  
}

function restart() {
  bgColor = color(30);
  background(bgColor);
  layoutOrderItems = orderer.parseItemStrings(layoutOrder());
  console.log(layoutOrderItems);
}

var layoutOrderIx = 0;
//a sample placement order - this'd be generated algorithmically from the desired layout and number of stacks.

function shouldShowThisTile(tileNum) {
  return (tileNum >= firstTileNumToShow && tileNum < firstTileNumToShow + numTilesToShow);

}

function toLetter(n) {
  return String.fromCharCode(n + "a".charCodeAt(0));
}

function draw() {

  var cornerV = 10;
  var squareSize = 40;
  var squareColor = color('gray');
  //color(0, 100, 255);
  var hilitSquareColor =  color("#fcb543");
  var hilitSquareTextColor = color(255);
  var normalSquareTextColor = color(0);
  background(bgColor);
  var floorSize = 4;
  rectMode(CENTER);
  var numFloors = 3;
  for (var floorNum = 0; floorNum < numFloors; floorNum++) {
    var floorStartX = 175 * floorNum;
    var floorStartY = 50;
    for (var row = 0; row < floorSize; row++) {
      for (var col = 0; col < floorSize; col++) {

        var x = floorStartX + squareSize * row;
        var y = floorStartY + squareSize * col;
        var item = layoutOrderItems.find(function(item) {
          return (item.col === col+1 &&
                  item.row === row+1 &&
                 item.floor === floorNum + 1
                 );
        });
        var d = {x: col, y: row, f: floorNum};
        var tileNum = layoutOrderItems.indexOf(item);

        if (tileNum < 0 ){
          throw "tile not found in layout: "+ [row, col, floorNum];
        }
        tileNum += 1;
        
        if (shouldShowThisTile(tileNum)) {
          fill(hilitSquareColor);
          rect(x, y, squareSize, squareSize, cornerV);
          fill(hilitSquareTextColor);
          text(tileNum, x, y);
        } else {
          fill(squareColor);
          rect(x, y, squareSize, squareSize, cornerV);
          fill(normalSquareTextColor);
          text(tileNum, x, y);
        }
      }
    }
  }
}

var TType = {
  PLACE: 1,
  PLAYER: 2,
  MONSTER: 3,
  FOOD: 4,
  ITEM: 5
};

function toggleDebug() {
  showDebug = !showDebug;
}

function togglePause() {
  keepLooping = !keepLooping;
  if (keepLooping) {
    loop();
  } else {
    noLoop();
  }
}

function mousePressed() {}

function showNextTiles() {
  var orig = firstTileNumToShow;
  
  firstTileNumToShow += numTilesToShow;  
  if (firstTileNumToShow > layoutOrderItems.length){
    firstTileNumToShow = orig;
  }
}
function showPrevTiles() {
  firstTileNumToShow -= numTilesToShow;  
  if (firstTileNumToShow < 1){
    firstTileNumToShow = 1;
  }

}

function keyTyped() {
  if (key === ".") {
    showNextTiles();
    draw();
  } else if (key === ",") {
    showPrevTiles();
    draw();
  } else if (key === "p") {
    togglePause();
  } else if (key === "d") {
    toggleDebug();
  } else {
    //we don't respond to this key
  }
}

function centre() {
  return newPos(width / 2, height / 2);
}

function newPos(x, y) {
  return {
    x: x,
    y: y
  };
}
