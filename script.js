//TODO:
// Add grid background to displayCanvas
// Reinitialize tileMap when tileSize is changed 
// Add behavior for JSON mode:
// - Add label input whenever a new tile is selected [x]
// - Create download JSON button that downloads contents of tileMap and the labels for each tile
// Add event listener for dragging mouse to draw tiles [x]
// Add feature to define size of output canvas [x]
// Add behavior for Image mode: [x]
// - Create download image button that downloads contents of displayCanvas [x]
// style page??


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
       console.log("Selected Image")
    } else {
        mode = 1;
        console.log("Selected JSON")
    }
});




const canvas = document.getElementById('uploadCanvas');
const ctx = canvas.getContext('2d');
let tileSize = 32; 
const tileSizeInput = document.getElementById('tileSizeInput');
const outputHeightInput = document.getElementById('outputHeight');
const outputWidthInput = document.getElementById('outputWidth');

outputHeightInput.addEventListener('change', function(e) {
    const height = parseInt(e.target.value);
    outputCanvas.height = height;
    highlightCanvas.height = height;
    tileMap = loadTileMap();
});
outputWidthInput.addEventListener('change', function(e) {
    const width = parseInt(e.target.value);
    outputCanvas.width = width;
    highlightCanvas.width = width;
    tileMap = loadTileMap();
});

tileSizeInput.addEventListener('change', function(e) {
    tileSize = parseInt(e.target.value);
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
    console.log('key:', key)
    if (selectedTilesMap[key]) {
        //Tile has already been selected before, find the associated label value
        id = selectedTilesMap[key];
    }
    else{
        //Tile has not been selected before, assign a new label value
        ++id;
        selectedTilesMap[key] = id
        labels[id] = {
            x: selectedTile.x * tileSize,
            y: selectedTile.y * tileSize};
    }
    console.log(labels)
    console.log(selectedTilesMap);
  });

var currentTile = new Image();
const outputCanvas = document.getElementById('displayCanvas');
const outputCtx = outputCanvas.getContext('2d');
outputCanvas.width = 800;
outputCanvas.height = 800;
outputCtx.fillStyle = 'grey';
outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

var tileMap = loadTileMap();

function loadTileMap(){
    let tileMap = new Array(Math.floor(outputCanvas.width/tileSize));
    for (let i = 0; i < tileMap.length; ++i) {
        tileMap[i] = new Array(Math.floor(outputCanvas.height/tileSize));
    }
    for (let i = 0; i < tileMap.length; ++i) {
        for (let j = 0; j < Math.floor(outputCanvas.height/tileSize); ++j) {
            tileMap[i][j] = 0;
        }
    }

    return tileMap;
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
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
    const link = document.createElement('a');
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

highlightCanvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    rightClick = e.button === 2;
});

highlightCanvas.addEventListener('mouseup', function(e) {
    isDragging = false;
});


highlightCanvas.addEventListener('mousemove', function(e) {
    if (!isDragging) {
        // Highlight the tile the mouse is currently hovering over
        const rect = highlightCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
      
        highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
        highlightCtx.strokeStyle = 'red';
        highlightCtx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    }
   else if (rightClick){
        //Dragging to erase tiles
        highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
        e.preventDefault();
        const rect = highlightCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / tileSize) * tileSize;
        const y = Math.floor((e.clientY - rect.top) / tileSize) * tileSize;
        tileMap[Math.floor(y/tileSize)][Math.floor(x/tileSize)] = 0;
        outputCtx.fillRect(x, y, tileSize, tileSize);
    }
    else{
        //Dragging to draw tiles
        drawTile(e);
    }
});

function drawTile(e){
    const rect = highlightCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize) * tileSize;
    const y = Math.floor((e.clientY - rect.top) / tileSize) * tileSize;
    tileMap[Math.floor(y/tileSize)][Math.floor(x/tileSize)] = id;
    console.log(tileMap);
    outputCtx.drawImage(tileImg, selectedTile.x * tileSize, selectedTile.y * tileSize, tileSize, tileSize, x, y, tileSize, tileSize);
}


highlightCanvas.addEventListener('click', drawTile);

highlightCanvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();

    const rect = highlightCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize) * tileSize;
    const y = Math.floor((e.clientY - rect.top) / tileSize) * tileSize;
    tileMap[Math.floor(y/tileSize)][Math.floor(x/tileSize)] = 0;
    outputCtx.fillRect(x, y, tileSize, tileSize);
});