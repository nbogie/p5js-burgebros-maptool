"use strict";
var buttonPositions = [];
var selectedButton;
var tInfos;

var tileList = [
  ["Safe", 3, [82, 133, 74]],
  ["Stairs", 3, [62, 73, 88]],
  ["Walkway", 3, [167, 217, 246]],
  ["Laboratory", 2, [167, 217, 246]],
  ["Lavatory", 1, [167, 217, 246]],
  ["Service Duct", 2, [93, 84, 29]],
  ["Secret Door", 2, [93, 84, 29]],
  ["Computer", 3, [162, 148, 172]],
  ["Camera", 4, [152, 11, 31]],
  ["Laser", 3, [179, 13, 19]],
  ["Motion", 3, [179, 13, 19]],
  ["Detector", 3, [179, 13, 19]],
  ["Fingerprint", 3, [179, 13, 19]],
  ["Thermo", 3, [179, 13, 19]],
  ["Keypad", 3, [191, 144, 40]],
  ["Deadbolt", 3, [191, 144, 40]],
  ["Foyer", 2, [206, 180, 31]],
  ["Atrium", 2, [206, 180, 31]]
]

function setup() {
  createCanvas(windowWidth, windowHeight);
  tInfos = buildTileInfos();

}

function drawTileInfos(tInfos) {
  var maxRows = 7;
  var numCols = 3;
  buttonPositions = [];
  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < maxRows; row++) {
      var ix = (col * maxRows) + row;
      if (ix < tInfos.length) {
        var ti = tInfos[ix];
        fill(ti.c);
        var numInCol = 5;
        var numCols = 3;
        var x = 20 + col * 200;
        var y = 15 + 20 * row;
        var w = 125;
        var h = 20;
        if ((selectedButton) && selectedButton.ix === ix) {
          stroke(255);
          strokeWeight(2);
        } else {
          stroke(0);
          strokeWeight(1);

        }
        rect(x, y, w, h);
        buttonPositions.push({
          dim: {
            x1: x,
            y1: y,
            x2: x + w,
            y2: y + h
          },
          name: ti.name
        });
        fill(0);
        textSize(12);
        noStroke();
        text(ti.name + " - " + ti.remainingNum + "/" + ti.totalNum, x + 20, y + 15);

      }
    }
  }
}

function buildTileInfos() {
  var tInfos = tileList.map(function(tInfo) {
    return {
      name: tInfo[0],
      totalNum: tInfo[1],
      remainingNum: tInfo[1],
      c: color(tInfo[2])
    };
  });
  return tInfos;
}

function mousePressed() {
  console.log("searching for button containing hit: " + [mouseX, mouseY]);

  var hitButtonMaybe = findHitThing(buttonPositions);

  if (hitButtonMaybe) {
    var selectedButtonIx = buttonPositions.indexOf(hitButtonMaybe);
    selectedButton = {
      ix: selectedButtonIx,
      tileInfo: tInfos[selectedButtonIx],
      name: tInfos[selectedButtonIx].name
    };
    console.log("found: " + hitButtonMaybe.name + " ix: " + selectedButton.ix + " info: " + selectedButton.name);
  } else {
    console.log("no button hit.");
  }
  //TODO: reinstate when we have tilePositions.
  var hitTileMaybe = findHitThing(tilePositions);
}

function findHitThing(hittables) {
  return hittables.find(function(thing) {
    return (mouseX >= thing.dim.x1 && mouseX <= thing.dim.x2 &&
      mouseY >= thing.dim.y1 && mouseY <= thing.dim.y2);
  });
}

function keyTyped() {
  if (key === "p") {
    placeSelectedButton();
  }
}

function unplaceSelectedTile() {
  //TODO: remove the selected tile instance from layout, if any

}

function placeSelectedButton() {
  if (selectedButton) {
    var info = selectedButton.tileInfo;
    if (info.remainingNum > 0) {
      info.remainingNum--;
      console.log("placed a " + info.name)
    } else {
      console.log("(none left)")
    }
  } else {
    return;
  }
}

function draw() {
  background(color(50));
  drawTileInfos(tInfos);
  fill(255);
  text("fc: " + frameCount, 200, 300);
}