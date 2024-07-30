//TODO:
// Add import JSON functionality


var currCtx = null;
var topCanvas = null;
var scale = 1;

let translateX = 0;
let translateY = 0;

const fileInput = document.getElementById('fileInput');

const tileImg = document.getElementById('tileImg');
tileImg.style.display = 'none';
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', function(e) {
        tileImg.src = e.target.result;
    });
    reader.readAsDataURL(file);
});


const modeSelect = document.getElementById('modeSelect');
var mode = 0;
modeSelect.addEventListener('change', function(e) {
    if (e.target.value === '0') {
        mode = 0;
    } else {
        mode = 1;
    }
});

const layerSelect = document.getElementById('layerSelect');
var layer = 1;
layerSelect.addEventListener('change', function(e) {
    layer = parseInt(e.target.value);
    currentCanvas = document.getElementById(`displayCanvas${layer}`);
});


const addLayerBtn = document.getElementById('addLayerBtn');
addLayerBtn.addEventListener('click', function(e) {
    const newLayer = document.createElement('option');
    const maxLayer = Array.from(layerSelect.options).reduce((max, option) => Math.max(max, parseInt(option.value)), 0);
    newLayer.value = maxLayer + 1;
    newLayer.text = `Layer`+ (maxLayer + 1);
    layerSelect.add(newLayer);
    layerSelect.selectedIndex = layerSelect.length - 1;
    layer = maxLayer + 1;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.id = `displayCanvas${maxLayer + 1}`;
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;   
    tempCanvas.style.position = 'absolute';
    tempCanvas.style.top = '0';
    tempCanvas.style.left = '0';

    addLayer();

    currentCanvas = tempCanvas;
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.insertBefore(tempCanvas, topCanvas.canvas);
});




const canvas = document.getElementById('uploadCanvas');
const ctx = canvas.getContext('2d');
let tileSize = 32; 
const tileSizeInput = document.getElementById('tileSizeInput');
const outputHeightInput = document.getElementById('outputHeight');
const outputWidthInput = document.getElementById('outputWidth');
var canvasHeight = 800;
var canvasWidth = 800;
var canvasLayers = [];


outputHeightInput.addEventListener('change', function(e) {
    let height = parseInt(e.target.value);
    canvasHeight = height;
    outputCanvas.height = canvasHeight;
    highlightCanvas.height = canvasHeight;
    backgroundCanvas.height = canvasHeight;
    topCanvas.height = canvasHeight;
    drawBackground();
    tileMap = loadTileMap();
});

outputWidthInput.addEventListener('change', function(e) {
    let width = parseInt(e.target.value);
    canvasWidth = width;
    outputCanvas.width = canvasWidth;
    highlightCanvas.width = canvasWidth;
    backgroundCanvas.width = canvasWidth;
    topCanvas.width = canvasWidth;
    drawBackground();
    tileMap = loadTileMap();
});

tileSizeInput.addEventListener('change', function(e) {
    tileSize = parseInt(e.target.value);
    topCanvas.tileSize = tileSize;
    drawBackground();
});

let selectedTile = { x: 0, y: 0 };
var selectedTilesMap = {};
var labels = {};
let id = 0;
tileImg.onload = function() {
    canvas.width = tileImg.width;
    canvas.height = tileImg.height;
    ctx.drawImage(tileImg, 0, 0, tileImg.width, tileImg.height);
};

canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
  
    // Redraw the image and the highlight square
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tileImg, 0, 0, tileImg.width, tileImg.height);
    ctx.strokeStyle = 'red';
    ctx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
});


canvas.addEventListener('click', function(e) {
    // Store the current tile
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedTile.x = Math.floor(x / tileSize);
    selectedTile.y = Math.floor(y / tileSize);
    const key = `${selectedTile.x},${selectedTile.y}`;
    console.log('key:', key);
    console.log('selectedTilesMap:', JSON.stringify(selectedTilesMap));
    if (selectedTilesMap[key]) {
        //Tile has already been selected before, find the associated label value
        id = selectedTilesMap[key];
    }
    else{
        //Tile has not been selected before, assign a new label value
        //Id should increment from the greatest ID so far, not just increment by 1 from the current
        // 
        id = Object.keys(labels).length + 1;
        selectedTilesMap[key] = id
        labels[id] = {
            x: selectedTile.x * tileSize,
            y: selectedTile.y * tileSize};
    }
  });

var currentTile = new Image();
const outputCanvas = document.getElementById('displayCanvas1');
const outputCtx = outputCanvas.getContext('2d');
outputCanvas.width = canvasWidth;
outputCanvas.height = canvasHeight;

var tileMap = loadTileMap();

function loadTileMap(){
    console.log("Attempting to recreate tileMap ...");
    let tileMap = {[layer]: new Array(Math.floor(outputCanvas.width/tileSize))} ;
    for (let i = 0; i < tileMap[layer].length; ++i) {
        tileMap[layer][i] = new Array(Math.floor(outputCanvas.height/tileSize));
    }   
    for (let i = 0; i < tileMap[layer].length; ++i) {
        for (let j = 0; j < Math.floor(outputCanvas.width/tileSize); ++j) {
            tileMap[layer][i][j] = 0;
        }
    }
    console.log("Tile Map recreated: " + JSON.stringify(tileMap));
    return tileMap;
}

function addLayer(){
    tileMap[layer] = loadTileMap()[layer]; 
    console.log(tileMap);
}
   
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', downloadCanvasAsPNG);
const downloadJSONButton = document.getElementById('jsonBtn');
downloadJSONButton.addEventListener('click', downloadJSON);

function downloadJSON(){
    const data = {
        tileMap: tileMap,
        labels: labels
    };
    const link = document.createElement('a');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
    link.href = dataStr;
    link.download = 'tileMap.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadCanvasAsPNG() {
    const dataUrl = outputCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'tileSet.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


const highlightCanvas = document.getElementById('highlightCanvas');
const highlightCtx = highlightCanvas.getContext('2d');
let isDragging = false;
let rightClick = false;
highlightCanvas.width = outputCanvas.width;
highlightCanvas.height = outputCanvas.height;

var currentCanvas = outputCanvas;

var topCanvas = new Canvas('highlightCanvas', tileSize, canvasWidth, canvasHeight);

topCanvas.canvas.addEventListener('click', function(e) {
    topCanvas.drawTile(currentCanvas, selectedTile, e, tileMap, layer, id, scale, translateX, translateY);
    console.log(tileMap);
    console.log(labels);
});


topCanvas.canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    rightClick = e.button === 2;
});

topCanvas.canvas.addEventListener('mouseup', function(e) {
    isDragging = false;
});

topCanvas.canvas.addEventListener('mousemove', function(e) {
    if (!isDragging){
        topCanvas.highlightTile(e, scale, translateX, translateY)
    }
    else if (rightClick){
        topCanvas.deleteTile(e, currentCanvas, layer, scale, translateX, translateY);
    }
    else{
        topCanvas.drawTile(currentCanvas, selectedTile, e, tileMap, layer, id, scale, translateX, translateY);
    }
});

topCanvas.canvas.addEventListener('contextmenu', function(e) {
    topCanvas.deleteSingleTile(e, currentCanvas, layer);
});


// topCanvas.canvas.addEventListener('wheel', function(e){
//     e.preventDefault();
//     const scaleFactor = e.deltaY < 0 ? 1.05 : 0.95; // Zoom in if scroll up, zoom out if scroll down

//     const rect = topCanvas.canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left; // Mouse x coordinates
//     const y = e.clientY - rect.top; // Mouse y coordinates

//     const dx = x - (x * scaleFactor);
//     const dy = y - (y * scaleFactor);
    
//     backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
//     topCanvas.ctx.clearRect(0, 0, topCanvas.canvas.width, topCanvas.canvas.height);
//     outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);


//     backgroundCtx.translate(x, y); // Translate to the mouse position
//     backgroundCtx.scale(scaleFactor, scaleFactor); // Scale the canvas context
//     backgroundCtx.translate(-x, -y); // Translate back
//     topCanvas.ctx.translate(x, y);
//     topCanvas.ctx.scale(scaleFactor, scaleFactor); // Scale the canvas context
//     topCanvas.ctx.translate(-x, -y); 
//     outputCtx.translate(x, y);
//     outputCtx.scale(scaleFactor, scaleFactor);
//     outputCtx.translate(-x, -y);

//     translateX += dx;
//     translateY += dy;

//     scale *= scaleFactor; // Update the scale
//     //backgroundCtx.scale(scaleFactor, scaleFactor);
    
//     drawBackground();
//     drawContent();
//     // Redraw the content of the canvas with the new scale // Clear the canvas
//     //

//     })
function drawContent(){
    let currentCtx = currentCanvas.getContext('2d');
    for (let i = 0; i < tileMap[layer].length; ++i) {
        for (let j = 0; j < tileMap[layer][i].length; ++j) {
            if (tileMap[layer][i][j] !== 0) {
                currentCtx.drawImage(tileImg, labels[tileMap[layer][i][j]].x, labels[tileMap[layer][i][j]].y, tileSize, tileSize, j * tileSize, i * tileSize, tileSize, tileSize);
                //topCanvas.drawTile(currentCanvas, labels[tileMap[layer][i][j]], {clientX: i * tileSize * scale, clientY: j * tileSize * scale}, tileMap, layer, tileMap[layer][i][j], scale);
                // currentTile.onload = function() {
                //     outputCtx.drawImage(currentTile, labels[tileMap[layer][i][j]].x, labels[tileMap[layer][i][j]].y, tileSize, tileSize, i * tileSize * scale, j * tileSize * scale, tileSize, tileSize);
                // }
                // currentTile.src = tileImg.src;
            }
        }
    }

}


const backgroundCanvas = document.getElementById('backgroundCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');
backgroundCanvas.width = canvasWidth;
backgroundCanvas.height = canvasHeight;
backgroundCanvas.style.position = 'absolute';
backgroundCanvas.style.top = '0';
backgroundCanvas.style.left = '0';

function drawBackground(){
    backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
    for (let i = 0; i < backgroundCanvas.width; i += tileSize) {
        for (let j = 0; j < backgroundCanvas.height; j += tileSize) {
            backgroundCtx.strokeRect(i, j, tileSize, tileSize);
        }
    }
}

drawBackground();