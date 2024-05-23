class Canvas{
    constructor(id, tileSize, width, height){
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.listeners = {}
    }

    addEventListener(event, callback){
        this.canvas.addEventListener(event, callback);
        this.listeners[event] = callback;
    }

    removeEventListener(event){
        this.canvas.removeEventListener(event, this.listeners[event]);
        delete this.listeners[event];
    }

    drawTile(canvas, selectedTile, e, tileMap, layer, id){
        console.log("Layer being drawn on: " + layer);
        const currCanvas = canvas;
        const rect = currCanvas.getBoundingClientRect();
        const currCtx = currCanvas.getContext('2d');
        const x = Math.floor((e.clientX - rect.left) / this.tileSize) * this.tileSize;
        const y = Math.floor((e.clientY - rect.top) / this.tileSize) * this.tileSize;
        currCtx.drawImage(tileImg, selectedTile.x * this.tileSize, selectedTile.y * this.tileSize, this.tileSize, this.tileSize, x, y, this.tileSize, this.tileSize);

        tileMap[layer][Math.floor(y/tileSize)][Math.floor(x/tileSize)] = id;
    }


    highlightTile(e){
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
      
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = 'red';
        this.ctx.strokeRect(tileX * tileSize, tileY * tileSize, tileSize, tileSize);
    }

    deleteTile(e, canvas, layer){
        console.log("Calling deleteTile()")
        const currCanvas = canvas;
        const currCtx = currCanvas.getContext('2d');
        this.ctx.clearRect(0, 0, this.width, this.height);
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.tileSize) * this.tileSize;
        const y = Math.floor((e.clientY - rect.top) / this.tileSize) * this.tileSize;
        currCtx.clearRect(x, y, this.tileSize, this.tileSize);
        tileMap[layer][Math.floor(y/this.tileSize)][Math.floor(x/this.tileSize)] = 0;
    }

    deleteSingleTile(e, canvas, layer){
        console.log("calling deleteSingleTile()")
        const currCanvas = canvas;
        const currCtx = currCanvas.getContext('2d');
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.tileSize) * this.tileSize;
        const y = Math.floor((e.clientY - rect.top) / this.tileSize) * this.tileSize;
        currCtx.clearRect(x, y, this.tileSize, this.tileSize);
        tileMap[layer][Math.floor(y/this.tileSize)][Math.floor(x/this.tileSize)] = 0;
    }


}