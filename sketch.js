"use strict";
var bgColor = 0;
var showDebug = false;
var layoutOrderItems;

var showHelp = true;

var Mode = {DESIGN: 1, STACK: 2, FOLLOW: 3};
var mode = Mode.DESIGN;
var squareSize = 40;

var floorSize;
var numFloors;

var firstTileNumToShow = 1;
var numTilesToShow = 6;

var tileButtons;
var typeButtons;
var selectedTypeButton;

var tInfos;

var unassignedSquareColor;

var tileList = [
  ["Safe", 3, [82, 133, 74], "SA"],
  ["Stairs", 3, [62, 73, 88], "ST"],
  ["Walkway", 3, [167, 217, 246], "WA"],
  ["Laboratory", 2, [167, 217, 246], "LB"],
  ["Lavatory", 1, [167, 217, 246], "LV"],
  ["Service Duct", 2, [93, 84, 29], "DU"],
  ["Secret Door", 2, [93, 84, 29], "DO"],
  ["CR(Laser)", 1, [162, 148, 172], "CL"],
  ["CR(Fprint)", 1, [162, 148, 172], "CF"],
  ["CR(Motion)", 1, [162, 148, 172], "CM"],
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
      }
  }
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
//TODO: add walls serialisation
//TODO: give map format a more distinct name
//TODO: Check and update tile-type remaining-counts once all imported.
//      Reject if the map cannot be build with the standard tile set.
function loadMapFrom(str){
  //e.g.
  //bbrosMap0124444FOCFMOLBCLCACASAKEKEWADUTHSTDOLAFIMOLVSTLADELBCMKECALADOTHMODUSA
  //...or a 3x3 with some unassigned tiles:
  //bbrosMap013444444UAUACALVWADEFISALBSTLATHDELALADULBATSADOUAWATHWAUAUADUCAATCFSTCMDEMODEFICAFODEKEMODESTFICLSADOUA
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

  var meta = {
    tag: first8, 
    version: version, 
    numFloors: numFl, 
    floorDims: floorDims, 
    tileInfosForMap: tileInfosForMap,
    originalStr: str
  };
  console.log(meta);
  
  layoutFloors(numFl, floorDims, squareSize, tileInfosForMap);
}

function codeForTypeAtTile(tileButton){
  return isOccupied(tileButton) ? tileButton.tInfo.code : "UA";
}
function serialiseMap(){
  //JSON.stringify(tileButtons);
  //encodeURIComponent("foo")
  var floorWidth = floorSize;
  var floorHeight = floorSize;

  var dimStr = numFloors + (""+floorHeight + ""+floorWidth).repeat(numFloors);
  var tilesStr = tileButtons.map(codeForTypeAtTile).join("");
  var versionStr = "01";
  return "bbrosMap" + versionStr + dimStr + tilesStr;
}

function setup() {

  var mapTextInput = createInput('');  
  
  var importButton = createButton('Import map');
  importButton.mousePressed(function(){
    loadMapFrom(mapTextInput.value());
  });

  var exportButton = createButton('Export map');
  exportButton.mousePressed(function(){
    mapTextInput.value(serialiseMap());
  });

  createCanvas(windowWidth, windowHeight);
  frameRate(10);
  unassignedSquareColor = color(200);
  restart();
}

function restart() {
  numFloors = 3;
  floorSize = 4;
  
  bgColor = color(30);
  background(bgColor);
  
  tInfos = buildTileInfos();
  layoutFloors(
    numFloors, 
    Array(numFloors).fill({w:floorSize, h:floorSize}), 
    squareSize);
  layoutOrderItems = orderer.parseItemStrings(layoutOrder());
}

//a sample placement order - this'd be generated algorithmically from the desired layout and number of stacks.

function shouldShowThisTile(tileNum) {
  return (tileNum >= firstTileNumToShow && tileNum < firstTileNumToShow + numTilesToShow);

}

function draw() {
  background(bgColor);  
  //  drawPlaceTilesFromStacksGuide();
  drawTiles(squareSize);
  drawTileInfos(tInfos);
  if(showHelp){
    drawHelp();
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
    "Export: Save current map to string form, into box",
    "Reload browser tab: Clear the map.  Sorry."
  ]
  
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

function drawTiles(squareSize){
  var normalSquareTextColor = color(0);
  var cornerRad = 10;

  rectMode(CORNER);
  for(var tb of tileButtons){
      fill(colorForTile(tb));
      rect(tb.dim.x1, tb.dim.y1, tb.dim.w, tb.dim.h, cornerRad);
      fill(normalSquareTextColor);
      noStroke();
      textSize(10);
      text(labelForTile(tb), tb.dim.x1+2, tb.dim.y1+squareSize*0.55);
  }
}

function layoutFloor(floorNum, allFloorsStartX, allFloorsStartY, floorDim, squareSize, tileInfosForFloor){
  var squareSpacingForWalls = 10;
  var floorWidth = 230 * floorNum;
  
  for (var row = 0; row < floorDim.h; row++) {
    for (var col = 0; col < floorDim.w; col++) {

      var x = floorWidth + allFloorsStartX + squareSize * col + col*squareSpacingForWalls;
      var y = allFloorsStartY + squareSize * row + row*squareSpacingForWalls;

      //START MAIN CREATION OF TILE BUTTON
      var tileButton = {
        dim: { 
          x1: x, 
          y1: y, 
          x2: (x + squareSize), 
          y2: (y + squareSize),
          w: squareSize, 
          h: squareSize,
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
}

function layoutFloors(numFloors, floorDims, squareSize, tileInfosForMap){
  tileButtons = [];
  
  //reset counts
  for(var ti of tInfos){
    ti.remainingNum = ti.totalNum;
  }
  
  for (var floorNum = 0; floorNum < numFloors; floorNum++) {
    var dim = floorDims[floorNum];
    var nTilesInFloor = dim.w * dim.h;
    var tileInfosForFloor = tileInfosForMap ? tileInfosForMap.splice(0, nTilesInFloor) : undefined; 
    layoutFloor(floorNum, 30, 50, dim, squareSize, tileInfosForFloor);
  }
}

function drawPlaceTilesFromStacksGuide(){
  var cornerRad = 10;
  var squareSize = 40;
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

        var x = floorStartX + squareSize * row;
        var y = floorStartY + squareSize * col;
        var item = layoutOrderItems.find(makeFinderFor(col, row));
        var tileNum = layoutOrderItems.indexOf(item);

        if (tileNum < 0 ){
          throw "tile not found in layout: "+ [row, col, floorNum];
        }
        tileNum += 1;
        
        if (shouldShowThisTile(tileNum)) {
          fill(hilitSquareColor);
          rect(x, y, squareSize, squareSize, cornerRad);
          fill(hilitSquareTextColor);
          noStroke();
          text(tileNum, x, y);
        } else {
          fill(squareColor);
          rect(x, y, squareSize, squareSize, cornerRad);
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
        text(ti.name + " - " + ti.remainingNum + "/" + ti.totalNum, x+10, y + 15);

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
  } else if (key === "d") {
    toggleDebug();
  } else {
    //we don't respond to this key
  }
}
