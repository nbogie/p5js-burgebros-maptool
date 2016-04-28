"use strict";
var bgColor = 0;
var wallColor;
var showDebug = false;
var layoutOrderItems;

var gFloorDims;

var floorsValid = [];

var showHelp = false;

var Mode = {DESIGN: 1, STACK: 2, FOLLOW: 3};
var Dir = {NORTH: 'N', EAST: 'E', SOUTH: 'S', WEST: 'W'};

var mode = Mode.DESIGN;
var squareSizePx = 40;

var floorSize;
var numFloors;

var firstTileNumToShow = 1;
var numTilesToShow = 6;

var tileButtons;
var wallButtons;
var typeButtons;
var selectedTypeButton;

var tInfos;

var unassignedSquareColor;
var sampleLevels = [
  "bbrosMap013444444STTHDUMODECFCADOTHDBSAFICLLAFITHCAMOLADEATWAATDUSTLBFOSADBDEMOLAWAFOCMCALVKEWACAKEDBSALBSTKEDOFI-011100000010001010101001000001110000111000010100010100000110010011001001", 
  "bbrosMap013444444LAFODEDEDUDEKEFISTDOCMFIATSALVCAFIKESTWALBDBDUATKEMOLASAWACFLAMOCADBTHCLSADBDOCAMOLBTHTHWACASTFO-101010101001010100001000000101000010100001010000100010011000110101000010"
];
var sampleLevel = sampleLevels[0];

var tileList = [
  ["Safe", 3, [82, 133, 74], "SA"],
  ["Stairs", 3, [62, 73, 88], "ST"],
  ["Walkway", 3, [167, 217, 246], "WA"],
  ["Laboratory", 2, [167, 217, 246], "LB"],
  ["Lavatory", 1, [167, 217, 246], "LV"],
  ["Service Duct", 2, [93, 84, 29], "DU"],
  ["Secret Door", 2, [93, 84, 29], "DO"],
  ["Comp. Laser", 1, [162, 148, 172], "CL"],
  ["Comp. FPrint ", 1, [162, 148, 172], "CF"],
  ["Comp. Motion ", 1, [162, 148, 172], "CM"],
  ["Camera", 4, [152, 11, 31], "CA"],
  ["Laser", 3, [179, 13, 19], "LA"],
  ["Motion", 3, [179, 13, 19], "MO"],
  ["Detector", 3, [179, 13, 19], "DE"],
  ["Fingerprint", 3, [179, 13, 19],"FI"],
  ["Thermo", 3, [179, 13, 19], "TH"],
  ["Keypad", 3, [191, 144, 40], "KE"],
  ["Deadbolt", 3, [191, 144, 40], "DB"],
  ["Foyer", 2, [206, 180, 31], "FO"],
  ["Atrium", 2, [206, 180, 31], "AT"]
]; //Code UA used for Unassigned


function buildTileInfos() {
  var list = tileList.map(function(tInfo) {
    return {
      name: tInfo[0],
      totalNum: tInfo[1],
      remainingNum: tInfo[1],
      c: color(tInfo[2]),
      code: tInfo[3]
    };
  });
  return list;
}


function mousePressed() {

  var hitButtonMaybe = findHitThing(typeButtons);

  if (hitButtonMaybe) {
    var selectedTypeButtonIx = typeButtons.indexOf(hitButtonMaybe);
    selectedTypeButton = {
      ix: selectedTypeButtonIx,
      tileInfo: tInfos[selectedTypeButtonIx],
      name: tInfos[selectedTypeButtonIx].name
    };
  } else {

      var hitTileMaybe = findHitThing(tileButtons);
      if (hitTileMaybe) {

        clickedTileButton(hitTileMaybe);
      } else {
        var hitWallMaybe = findHitThing(wallButtons);
        if (hitWallMaybe) {
          clickedWallButton(hitWallMaybe);
        } else {
        }
      }
  }
  validateFloors();
}
function countTilesOfNameInFloor(tileName, floorNum){
  var res = findTilesOfNameInFloor(tileName, floorNum);
  return (res ? res.length : 0);
}


function findEssentialTypesRemaining(){
  return tInfos.filter(function(tInfo) { 
    return (tInfo.remainingNum > 0 && 
      (tInfo.name === "Stairs" ||
       tInfo.name === "Safe"));
  });  
}

function findTypesRemaining(){
  return tInfos.filter(function(tInfo) { 
    return (tInfo.remainingNum > 0);
  });    
}

function findUnoccupiedTiles(){
  return tileButtons.filter(function(tileBtn) { 
    return !isOccupied(tileBtn);
  });  
}

function findTilesOfNameInFloor(tileName, floorNum){
  return tileButtons.filter(function(tileBtn) { 
    return (isOccupied(tileBtn) && 
            labelForTile(tileBtn) === tileName && 
            tileBtn.floorNum === floorNum);
  });
}

function pick(arr) {
  return arr[floor(random() * arr.length)];
}


function isOkayToUseTypeOnFloor(typeBtn, floorNum){
  if (typeBtn.name === "Safe"  && (countTilesOfNameInFloor("Safe", floorNum) > 0)){
    console.log("INVALID: floor has too many already of " + typeBtn.name);
    return false;
  }
  if (typeBtn.name === "Stairs"  && (countTilesOfNameInFloor("Stairs", floorNum) > 0)){
    console.log("INVALID: floor has too many already of " + typeBtn.name);
    return false;
  }
  return true;
}

function clickedWallButton(wallBtn){
  console.log("clicked wall button: " + wallBtn);
  wallBtn.isOn = ! wallBtn.isOn;
}

function clickedTileButton(tileBtn){
  
  //shift-clicked?  remove if any occupant
  if (keyIsPressed && (keyCode === SHIFT)){
    if (isOccupied(tileBtn)){
      vacateSelectedButton(tileBtn);
    }
  } else {

    if(selectedTypeButton){
      if (isOkayToUseTypeOnFloor(selectedTypeButton, tileBtn.floorNum)){
        if (isEmpty(tileBtn)){
          placeSelectedButtonUnconditionally(tileBtn);
        }else {
          vacateSelectedButton(tileBtn);
          placeSelectedButtonUnconditionally(tileBtn);
        }
      }
    }

  }
}

function findHitThing(hittables) {
  return hittables.find(function(thing) {
    return (mouseX >= thing.dim.x1 && mouseX <= thing.dim.x2 &&
      mouseY >= thing.dim.y1 && mouseY <= thing.dim.y2);
  });
}


function isEmpty(tileBtn){
  return !isOccupied(tileBtn); 
}

function isOccupied(tileBtn){
  return tileBtn.tInfo;
}

function vacateSelectedButton(tileBtn){
  tileBtn.tInfo.remainingNum++;
  tileBtn.tInfo = null;
  
}


function placeSelectedButtonUnconditionally(destinationTileButton) {
  if (selectedTypeButton) {
    var info = selectedTypeButton.tileInfo;
    if (info.remainingNum > 0) {
      info.remainingNum--;
      destinationTileButton.tInfo = info;
      //that was the last one - deselect tiletype button
      if (info.remainingNum === 0){
        selectedTypeButton = null;
      }
    } else {
      console.log("(none left)");
      selectedTypeButton = null;
    }
  } else {
    return;
  }
}


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
    };
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
  };
})();

function findTileInfoForCode(code) {
  return tInfos.find(function(ti){ return (ti.code === code); });
}

function numWallPositionsForFloor(w, h){ return 2*w*h - w - h; }


function numWallPositionsForMap(floorDims) {
  return floorDims.reduce(function(tot, d) {
    return tot + numWallPositionsForFloor(d.w, d.h);
  }, 0);
}

// ======== bbrosMap format ========
//literal: bbrosMap
//dd: version - two digits, zero padded
//d: num floors
//Then, for each floor as specified by num floors,
//  d: width of floor
//  d: height of floor
//Then, reading floors from first to last, 
//        reading rows from top to bottom
//          reading columns from left to right
//            [A-Z][A-Z]: Code for tile type at that position
//Then, for every wall position, either a 1 or 0 to show that wall's state.
//TODO: give map format a more distinct name
//TODO: Check and update tile-type remaining-counts once all imported.
//      Reject if the map cannot be build with the standard tile set.
function loadMapFrom(str){
  //e.g.
  //bbrosMap013444444UALBDUSTWAMOCADUATCLWATHSADBCALVSADECFMOKELAKEDEMOCACAWAATSTLAFISTDBLBFODOFIKEDOFISADEFODBTHCMUA101000001000000000000010000000000000001111010111000001010010001000010010010010000000000010000001000000101000001000000011
  var first8 = str.substring(8, 0);
  var expectedTag = "bbrosMap";
  if(first8!==expectedTag){
    console.log("Ignoring bad map load. Text is missing expected start of '"+expectedTag+"'");
    return;
  }
  var version1 = parseInt(str.substring(8, 9));
  var version2 = parseInt(str.substring(9, 10));
  var version = [version1, version2];
  var numFl = parseInt(str.substring(10, 11));
  if (numFl < 1){
    throw "Error: invalid number of floors in serialised map: "+numFl + ", in " + str;
  }
  var offset = 11;
  var floorDims = [];
  for(var f=0; f<numFl; f++){
    var w = parseInt(str.substring(offset, offset+1));
    var h = parseInt(str.substring(offset+1, offset+2));
    floorDims.push({w:w,h:h});
    offset+=2;
  }

  var tileInfosForMap = [];
  for(f=0; f < numFl; f++){
    for (var c=0; c < floorDims[f].w; c++){
      for (var r=0; r < floorDims[f].h; r++){
        var code = str.substring(offset, offset+2);
        tileInfosForMap.push(findTileInfoForCode(code));
        offset+=2;      
      }
    }
  }

  //skip forward past separator
  var remainder = str.substring(offset+1, str.length);
  var wallsCodes = remainder.substring(0, numWallPositionsForMap(floorDims)).split("");
  //var wallsCodes = decodeWallsHexStringToTrimmedBinStringOfLen(remainder, totalNumWallsExpected).split("");

  var wallsForMap = [];
  for(f=0; f < numFl; f++){
    var w = floorDims[f].w;
    var h = floorDims[f].h;

    for(var wi=0; wi < numWallPositionsForFloor(w,h); wi++){
        var wallCode = wallsCodes.shift();
        wallsForMap.push(wallCode==='1');
    }
  }

  var meta = {
    tag: first8, 
    version: version, 
    numFloors: numFl, 
    floorDims: floorDims, 
    tileInfosForMap: tileInfosForMap,
    wallsForMap: wallsForMap,
    originalStr: str
  };
  console.log(meta);
  
  layoutFloors(numFl, floorDims, squareSizePx, tileInfosForMap, wallsForMap);
}

function codeForTypeAtTile(tileButton){
  return isOccupied(tileButton) ? tileButton.tInfo.code : "UA";
}

//credit: http://stackoverflow.com/users/1608816/tobspr
function checkBin(n){return/^[01]{1,64}$/.test(n);}
function checkHex(n){return/^[0-9A-Fa-f]{1,64}$/.test(n);}
function pad(s,z){s=""+s;return s.length < z ? pad("0"+s,z) : s;}
function Bin2Hex(n){if(!checkBin(n))return 0;return parseInt(n,2).toString(16);}
function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2);}

function padLenToMultipleOf4(str){
  if (str.length % 4 !== 0){
    var targetLen = 4 * ( 1 + Math.floor(str.length/4));
    str = pad(str, targetLen);
  }
  return str;
}


function encodeWallsBinStringToHexString(binStr){
  if (binStr.length === 0){
    return "";
  }
  var paddedBin = padLenToMultipleOf4(binStr);
  var paddedHexExpectedLen = paddedBin.length / 4;

  var hexStr = "";
  while(paddedBin.length > 0){
    var hexChunk = Bin2Hex(paddedBin.substring(0, 64));
    hexStr += pad(hexChunk, paddedBin.length / 4);
    paddedBin = paddedBin.slice(64);
  }
  return hexStr;
}

function decodeWallsHexStringToTrimmedBinStringOfLen(hexStr, expectedLen){
  if (hexStr === ""){
    return "";
  }
  var paddedBin = Hex2Bin(hexStr);
  var paddingLen = paddedBin.length - expectedLen;
  return paddedBin.slice(paddingLen);
}

function serialiseMap(){
  //JSON.stringify(tileButtons);
  //encodeURIComponent("foo")
  function codeForWall(wb){
    return wb.isOn? '1' : '0';
  }
  var floorWidth = floorSize;
  var floorHeight = floorSize;

  var dimStr = numFloors + (""+floorHeight + ""+floorWidth).repeat(numFloors);
  var tilesStr = tileButtons.map(codeForTypeAtTile).join("");
  var wallsStr = wallButtons.map(codeForWall).join("");
  //wallsStr = encodeWallsBinStringToHexString(wallsStr);
  var versionStr = "01";
  return "bbrosMap" + versionStr + dimStr + tilesStr + "-" + wallsStr;
}

function setupHTMLElems(){
  var mapTextInput = createInput(sampleLevel);
  
  var importButton = createButton('Import map');
  importButton.mousePressed(function(){
    loadMapFrom(mapTextInput.value());
  });

  var exportButton = createButton('Export map');
  exportButton.mousePressed(function(){
    mapTextInput.value(serialiseMap());
  });  
}

function setup() {
  setupHTMLElems();

  createCanvas(windowWidth, windowHeight);
  frameRate(10);
  unassignedSquareColor = color(200);
  restart();
}

function restart() {
  numFloors = 3;
  floorSize = 4;
  
  bgColor = color(30);
  wallColor = color([211, 164, 60]);
  //wallColor = color([221, 174, 70]);

  background(bgColor);
  
  tInfos = buildTileInfos();
  layoutFloors(
    numFloors, 
    Array(numFloors).fill({w:floorSize, h:floorSize}), 
    squareSizePx);
  layoutOrderItems = orderer.parseItemStrings(layoutOrder());
}

//a sample placement order - this'd be generated algorithmically from the desired layout and number of stacks.

function shouldShowThisTile(tileNum) {
  return (tileNum >= firstTileNumToShow && tileNum < firstTileNumToShow + numTilesToShow);

}

function draw() {
  background(bgColor);  
  //  drawPlaceTilesFromStacksGuide();
  drawTiles(squareSizePx);
  drawWalls();
  drawTileInfos(tInfos);
  if(showHelp){
    drawHelp();
  }
  drawFloorsValid();
}

function drawFloorsValid(){
  for (var i=0; i < floorsValid.length; i++){
    fill(255);
    text([i, floorsValid[i]], 40, 500+i*40);
  }
}
function drawHelp(){
  fill(50);
  var m = 100;
  rect(m,m,width-(m*2), height-(m*2));
  var lines = [
    "Burgle Bros map editor and (eventual) blind-layout guide", 
    "", 
    "h: Toggle this help screen", 
    "r: Randomly fill the remaining spaces",
    "c: Clear map",
    "Click: (on a tile space) Assign chosen type to space",
    "Shift-click: (on a tile space) Remove tile assignment of space",
    "Import: Load a map from a string in the input box",
    "Export: Save current map to string form, into box"
  ];
  
  fill(255);
  textSize(18);
  for (var i in lines){
    var line = lines[i];
    text(line, m*1.5, m*2 + i*30);
  }

}

function colorForType(tInfo){
  if (tInfo.remainingNum === 0){
    return color(100);
  } else if (tInfo.remainingNum < 0){
    return color('pink');
  } else {
    return tInfo.c;
  }
}

function colorForTile(tileBtn){
  return isOccupied(tileBtn) ? tileBtn.tInfo.c : unassignedSquareColor;
}
function labelForTile(tileBtn){
  return isOccupied(tileBtn) ? tileBtn.tInfo.name : " - ";
}

function drawTiles(squareSizePx){
  var normalSquareTextColor = color(0);
  var cornerRad = 10;

  rectMode(CORNER);
  for(var tb of tileButtons){
      fill(colorForTile(tb));
      rect(tb.dim.x1, tb.dim.y1, tb.dim.w, tb.dim.h, cornerRad);
      fill(normalSquareTextColor);
      noStroke();
      textSize(10);
      var lines = labelForTile(tb).split(" ");
      for (var i in lines){
        var line = lines[i];
        text(line, tb.dim.x1+2, tb.dim.y1 + squareSizePx*0.55 +10*i);
      }
  }
}

function colorForWall(wb){
  return color(wallColor);
}

function drawWalls(squareSizePx){
  rectMode(CORNER);
  for(var wb of wallButtons){
      //stroke(255);
      //strokeWeight(2);
      if (wb.isOn){
        fill(colorForWall(wb));
        rect(wb.dim.x1, wb.dim.y1, wb.dim.w, wb.dim.h);
      }
  }
}

function layoutFloor(floorNum, xOffsetForFloor, allFloorsStartX, allFloorsStartY, floorDim, squareSizePx, tileInfosForFloor, wallsForFloor){
  var squareSpacingForWalls = 10;
  console.log("laying out one floor with "+ wallsForFloor);
  function createWallButtonAt(col, row, dir, isOn){
    var wallDimNarrowPx = 10;
    var wallDimLongPx = squareSizePx;

    //START MAIN CREATION OF WALL BUTTON
    function isHoriz(){
      return (dir === Dir.NORTH || dir === Dir.SOUTH);
    }
    function isVert(){
      return !isHoriz();
    }
    
    function squareXOffsetForWall(){
      switch(dir){
        case Dir.NORTH:
        case Dir.SOUTH:
        default: 
          return 0;
          break;
        case Dir.EAST:
          return squareSizePx;
        case Dir.WEST:
          return - wallDimNarrowPx;
      }
    }
    function squareYOffsetForWall(){
      switch(dir){
        case Dir.EAST:
        case Dir.WEST:
        default: 
          return 0;
        break;
        case Dir.SOUTH:
          return squareSizePx;
        case Dir.NORTH:
          return - wallDimNarrowPx;
      }
    }

    var wallWidthPx = isVert() ? wallDimNarrowPx : wallDimLongPx;//vertical
    var wallHeightPx = isVert() ? wallDimLongPx : wallDimNarrowPx;//horizontal
    
    var x = allFloorsStartX + xOffsetForFloor + (col * (squareSizePx + wallDimNarrowPx)) + squareXOffsetForWall();
    var y = allFloorsStartY + (row * (squareSizePx + wallDimNarrowPx)) + squareYOffsetForWall();
    return {
      dim: { 
        x1: x, 
        y1: y,
        x2: (x + wallWidthPx), 
        y2: (y + wallHeightPx),
        w: wallWidthPx, 
        h: wallHeightPx,
      },
      isOn: isOn,
      col: col,
      row: row, 
      dir: dir,
      floorNum: floorNum
    };
  }

  function getNextWallStateOrOff(){
    if (wallsForFloor && wallsForFloor.length > 0){
      return wallsForFloor.shift();
    }
  }
      
  //Wall rules while rendering a tile:
  //  Always render the walls to the West and North.
  //  If this is the last in a row, also render the wall to the East.
  //  If this is the last in a column, also render the wall to the South.
  for (var row = 0; row < floorDim.h; row++) {
    for (var col = 0; col < floorDim.w; col++) {
  
      if (col !== 0){
        wallButtons.push(createWallButtonAt(col, row, Dir.WEST, getNextWallStateOrOff()));
      }
      if (row !==0){
        wallButtons.push(createWallButtonAt(col, row, Dir.NORTH, getNextWallStateOrOff()));
      }

      var x = xOffsetForFloor + allFloorsStartX + squareSizePx * col + col*squareSpacingForWalls;
      var y = allFloorsStartY + squareSizePx * row + row*squareSpacingForWalls;

      //START MAIN CREATION OF TILE BUTTON
      var tileButton = {
        dim: { 
          x1: x, 
          y1: y, 
          x2: (x + squareSizePx), 
          y2: (y + squareSizePx),
          w: squareSizePx, 
          h: squareSizePx,
        },
        col: col,
        row: row, 
        floorNum: floorNum,
      };
      if (tileInfosForFloor && tileInfosForFloor.length > 0){
        tileButton.tInfo = tileInfosForFloor.shift();
        if(tileButton.tInfo){//not an unassigned (undefined) tile
          tileButton.tInfo.remainingNum--;
        }
      }
      tileButtons.push(tileButton);
    }
  }
  return 230 * (floorNum+1);
}

function layoutFloors(numFloors, floorDims, squareSizePx, tileInfosForMap, wallsForMap){
  tileButtons = [];
  wallButtons = [];
  gFloorDims = floorDims;
  //reset counts
  for(var ti of tInfos){
    ti.remainingNum = ti.totalNum;
  }

  var xOffsetForFloor = 0;
  for (var floorNum = 0; floorNum < numFloors; floorNum++) {
    var dim = floorDims[floorNum];
    var nTilesInFloor = dim.w * dim.h;

    var tileInfosForFloor = tileInfosForMap ? tileInfosForMap.splice(0, nTilesInFloor) : undefined; 
    var wallsForFloor = wallsForMap ? wallsForMap.splice(0, numWallPositionsForFloor(dim.w, dim.h)) : undefined; 
    xOffsetForFloor = layoutFloor(floorNum, xOffsetForFloor, 30, 50, dim, squareSizePx, tileInfosForFloor, wallsForFloor);
  }
}

function drawPlaceTilesFromStacksGuide(){
  var cornerRad = 10;
  var squareColor = color('gray');
  var hilitSquareColor =  color("#fcb543");
  var hilitSquareTextColor = color(255);
  var normalSquareTextColor = color(0);
  background(bgColor);
  var floorSize = 4;
  rectMode(CENTER);
  var numFloors = 3;

  var makeFinderFor = function(col, row){
    return function(item) {
      return (item.col === col+1 &&
              item.row === row+1 &&
              item.floor === floorNum + 1
             );
      };
    };

  for (var floorNum = 0; floorNum < numFloors; floorNum++) {
    var floorStartX = 30 + 175 * floorNum;
    var floorStartY = 50;
    
    for (var row = 0; row < floorSize; row++) {
      for (var col = 0; col < floorSize; col++) {

        var x = floorStartX + squareSizePx * row;
        var y = floorStartY + squareSizePx * col;
        var item = layoutOrderItems.find(makeFinderFor(col, row));
        var tileNum = layoutOrderItems.indexOf(item);

        if (tileNum < 0 ){
          throw "tile not found in layout: "+ [row, col, floorNum];
        }
        tileNum += 1;
        
        if (shouldShowThisTile(tileNum)) {
          fill(hilitSquareColor);
          rect(x, y, squareSizePx, squareSizePx, cornerRad);
          fill(hilitSquareTextColor);
          noStroke();
          text(tileNum, x, y);
        } else {
          fill(squareColor);
          rect(x, y, squareSizePx, squareSizePx, cornerRad);
          fill(normalSquareTextColor);
          noStroke();
          text(tileNum, x, y);
        }
      }
    }
  }
}

function drawTileInfos(tInfos) {
  typeButtons = [];
  rectMode(CORNER);
  var maxRows = 7;
  var numCols = 3;
  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < maxRows; row++) {
      var ix = (col * maxRows) + row;
      if (ix < tInfos.length) {
        var ti = tInfos[ix];
        fill(colorForType(ti));
        var x = 30 + col * 200;
        var y = 255 + 20 * row;
        var w = 125;
        var h = 20;
        if ((selectedTypeButton) && selectedTypeButton.ix === ix) {
          stroke(255);
          strokeWeight(2);
        } else {
          stroke(0);
          strokeWeight(1);

        }
        rect(x, y, w, h);
        
        typeButtons.push({
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
        text(ti.name + "   " + ti.remainingNum + "/" + ti.totalNum, x+10, y + 15);

      }
    }
  }
}

function removeElementFromArray(elem, arr){
  var index = arr.indexOf(elem);
  if (index > -1) {
    arr.splice(index, 1);
  }
}
function isWallOn(wallBtn){
  return wallBtn.isOn;
}
function isWallOff(wallBtn){
  return !isWallOn(wallBtn);
}

function accessibleNodeInDir(dir, col, row, floorNum, floorDim){
  var wb;
  var neighbour = [col, row];
  switch(dir) {
    case Dir.NORTH: 
      wb = wallButtonAt(floorNum, col, row, dir);  
      neighbour[1] = neighbour[1]-1;
      break;
    case Dir.WEST:
      wb = wallButtonAt(floorNum, col, row, dir);  
      neighbour[0] = neighbour[0]-1;
      break;
    case Dir.EAST:
      wb = wallButtonAt(floorNum, col+1, row, Dir.WEST);
      neighbour[0] = neighbour[0]+1;
      break;
    case Dir.SOUTH:
      neighbour[1] = neighbour[1]+1;
      wb = wallButtonAt(floorNum, col, row+1, Dir.NORTH);
      break;
    default:
      throw("invalid direction: "+dir);
    }
  if (wb && !wb.isOn) {
    return neighbour;
  } else {
    return undefined;
  }
}

function isEdgeTileAt(col, row, floorDim){
  return (
    col === 0 || 
    row === 0 ||
    col === (floorDim.w - 1) ||
    row === (floorDim.h - 1)
    );
}

function wallButtonAt(floorNum, col, row, dir){
  return wallButtons.find(
    function(wb){
      return (
        wb.col === col &&
        wb.row === row &&
        wb.floorNum === floorNum &&
        wb.dir === dir
        );
    });
}
function mouseMoved(){
  
}

function neighboursOf(n, floorNum, floorDim){
  var ns = [];
  var c = n[0];
  var r = n[1];
  var dirs = [Dir.NORTH, Dir.EAST, Dir.SOUTH, Dir.WEST];
  for(var d of dirs){
    var nb = accessibleNodeInDir(d, c, r, floorNum, floorDim);
    if (nb){
      ns.push(nb);
    }
  }
  return ns;
}

function valid(floorNum, floorDim){
  var numTilesInFloor = floorDim.w * floorDim.h;
  var firstNode = [0,0];
  
  var nodesToCheck = [ firstNode ];
  var visiteds = [];

  while (nodesToCheck.length > 0){
    var next = nodesToCheck.pop();
    if (isCoordInList(next, visiteds)){
      continue;
    }
    visiteds.push(next);
    var neighbours = neighboursOf(next, floorNum, floorDim);
    for (var nb of neighbours){
      nodesToCheck.push(nb);
    }
  }
  return (visiteds.length === numTilesInFloor);
}

function isCoordInList(p, list){
  return list.find(function(item) { 
                return item[0] === p[0] &&
                       item[1] === p[1];
               });
}
function placeWallsRandomly(n){
  //Attempt to place n walls across the map.  
  //Skip walls that make a level invalid.
  for(var i=0; i < n; i++){
    var emptyWalls = wallButtons.filter(isWallOff);
    var pickedWall = pick(emptyWalls);
    pickedWall.isOn = true;
    var floorNum = pickedWall.floorNum;
    var floorDim = {w: 4, h: 4}; //TODO: remove literal
    if (valid(floorNum, floorDim)){
      continue;
    } else {
      pickedWall.isOn = false;
    }
  }
}

function randomPlaceAllRemaining(){

  function randomlyPlaceFromList(typeFinder){
    var emptyTileButtons = findUnoccupiedTiles();
    var typesRemaining = typeFinder();
    
    var attempts = 0;
    while(emptyTileButtons.length > 0 && typesRemaining.length > 0 && attempts < 10000){
      var pickedSpot = pick(emptyTileButtons);
      var pickedType = pick(typesRemaining);
      if (isOkayToUseTypeOnFloor(pickedType, pickedSpot.floorNum)){
        pickedSpot.tInfo = pickedType;
        pickedType.remainingNum--;
      }
      attempts++;
      emptyTileButtons = findUnoccupiedTiles();
      typesRemaining = typeFinder();
    }
  }

  console.log("randomly placing all remaining tiles, essentials first...");
  randomlyPlaceFromList(findEssentialTypesRemaining);
  randomlyPlaceFromList(findTypesRemaining);
  
  placeWallsRandomly(floor(numWallPositionsForMap(gFloorDims) * 0.6));

  validateFloors();
}

function numWallSpotsInMap(){
}
function validateFloors(){
    floorsValid = [0,1,2].map(
      function(n) { 
        return valid(n, {w: 4, h: 4}); 
      }
    );
}
function toggleDebug() {
  showDebug = !showDebug;
}

function toggleHelp() {
  showHelp = !showHelp;
}

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
function clearMap(){
    restart();
}

function keyTyped() {
  if (key === ".") {
    showNextTiles();
  } else if (key === ",") {
    showPrevTiles();
  } else if (key === "r") {
    randomPlaceAllRemaining();
  } else if (key === "h") {
    toggleHelp();
  } else if (key === "c") {
    clearMap();
  } else if (key === "v") {
    validateFloors();
  } else if (key === "d") {
    toggleDebug();
  } else {
    //we don't respond to this key
  }
}
