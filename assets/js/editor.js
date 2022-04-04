import tiles from "./tiles.js";
import defaultMap from "./defaultMap.js";
import toUnity from "./toUnity.js";

export default class Editor {
  constructor() {
    this.loadButton = document.querySelector("#load");
    this.widthInput = document.querySelector("#amountX");
    this.heightInput = document.querySelector("#amountY");
    this.tilemap = document.querySelector(".tilemap");
    this.rotateButton = document.querySelector("#rotate");
    this.eraseButton = document.querySelector("#eraser");
    this.flipXButton = document.querySelector("#flip-x");
    this.flipYButton = document.querySelector("#flip-y");
    this.tilesRoot = document.querySelector(".tiles");
    this.tileset = document.querySelector(".tileset");
    this.importButton = document.querySelector("#import");
    this.level = document.querySelector("#level");
    this.heroPathButton = document.querySelector("#create-hero-path-button");
    this.tilesObjects = tiles;
    this.defaultMap = defaultMap;
    this.tileElements = [];
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.placeActive = false;
    this.activeTile = null;
    this.eraseMode = false;
    this.ghost = null;
    this.width = 0;
    this.height = 0;
    
    this.imageFolder = "../img/tiles/export/";


    // import default
    this.import(this.defaultMap);

    

    // handle import
    this.loadButton.addEventListener("click", e => {
      let width = this.widthInput.value;
      let height = this.heightInput.value;
      [width, height] = [width, height].map(e => parseInt(e));
      this.clearTiles();
      this.createBoard(width, height);
      this.export();
    })

    
    // handle map create
    this.importButton.addEventListener("click", e => {
      this.import(this.level.value);
    })

    // 
    this.populateTiles(this.tilesObjects);
    

    // rotate
    this.rotateButton.addEventListener("click", e => {
      this.rotate();
    })

    document.addEventListener("keydown", e => {
      console.log(e);
      if (e.code === "KeyR" && e.shiftKey) this.rotate(true);
      if (e.code === "KeyR" && !e.shiftKey) this.rotate();
      if (e.key === "x") this.doFlipX();
      if (e.key === "y") this.doFlipY();
    })
    
    // flip
    this.flipXButton.addEventListener("click", e => {
      this.doFlipX();
    })
    this.flipYButton.addEventListener("click", e => {
      this.doFlipY();
    });

    // erase
    this.eraseButton.addEventListener("click", e => {
      this.eraseMode = !this.eraseMode;
      this.updateErase();
    })


    // drag
    document.body.addEventListener("mousedown", e => {
      this.drag = true;
    })

    document.body.addEventListener("mouseup", e => {
      this.drag = false;
    })

    // disable drag 
    function noDrag(event) {
      event.preventDefault();
    }
    document.addEventListener('dragstart',noDrag,true);
    
    this.updateTransform();
    
  }

  updateErase() {
    this.eraseMode ? document.body.classList.add("erase-mode") : document.body.classList.remove("erase-mode")
  }

  toEdser() {
    console.log(JSON.stringify(this.tiles))
  }

  doFlipX() {
    this.flipX = !this.flipX;
    this.updateTransform();
  }
  
  doFlipY() {
    this.flipY = !this.flipY;
    this.updateTransform();
  }

  rotate(reverse = false) {
    console.log(reverse);
    this.rotation += reverse ? -1 : 1;
    this.rotation = this.rotation % 4;
    this.updateTransform();
  }

  updateTransform() {
    document.body.style.setProperty("--tiles-rotation", this.rotation);
    document.body.style.setProperty("--tiles-flip-x", this.flipX ? -1 : 1);
    document.body.style.setProperty("--tiles-flip-y", this.flipY ? -1 : 1);

    this.placeGhost(this.ghostX, this.ghostY, this.activeTile);
  }

  populateTiles(tiles) {
    this.tilesetTiles = [];
    for (let [id, tile] of Object.entries(tiles)) {
      if ("disabled" in tile && tile.disabled) continue;
      let element = document.createElement("div");
      element.classList.add("tileset-item");
      element.style.setProperty("--tile", `url('${this.imageFolder}${tile.image}')` );
      this.tilesetTiles.push(element);
      element.addEventListener("click", e => {
        this.setActiveTile(element, parseInt(id))
      })
      this.tileset.append(element);
    }
  }

  setActiveTile(element, tileId) {
    this.placeActive = true;
    this.eraseMode = false;
    this.updateErase();
    if (element.classList.contains("is-active")) this.placeActive = false;
    this.tilesetTiles.forEach(e => e.classList.remove("is-active"))
    if (this.placeActive) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
    this.activeTile = tileId;
  }

  export() {
    // filter finish
    let values = JSON.parse(JSON.stringify(this.tiles)); // deep copy
    console.log(values);
    for (let [tileId, tile] of Object.entries(values)) {
      let {x, y, rotation, flipX, flipY, layer, id} = tile;
      if (id == 99) {
        console.log(values[tileId]);
        values.splice(tileId, 1);
        values.push({x, y, rotation, flipX, flipY, layer: 0, id: 13});
        values.push({x, y, rotation, flipX, flipY, layer: 3, id: 14});
      }
    }


    let value = `${this.toUnity(values)}
===
${this.toEditor(this.tiles)}`;
this.level.value = value;
    this.toEdser();
  }

  toEditor(value) {
    let output = '';

    for (let tile of value) {
      let {x, y, rotation, flipX, flipY, layer, id} = tile;
      output += `${x} ${y} ${rotation} ${flipX ? 1 : 0} ${flipY ? 1 : 0} ${layer} ${id}\n`;
    }

    console.log(value);

    return output;
  }

  toUnity(value) {
    return toUnity(value, this.tilesObjects);
  }

  parseImport(value) {
    let all = [];
    let width = 0;
    let height = 0;

    let levelSplit = value.split("===");
    if (!levelSplit.length > 1) return;
    let level = levelSplit[1];
    let rows = value.split("\n");
    for (let row of rows) {
      let column = row.split(" ");
      if (column.length !== 7) continue;
      let parsed = row.split(" ").map(e => parseInt(e));
      if(!parsed.every(e => !isNaN(e))) continue;
      
      let [x, y, rotation, flipX, flipY, layer, id] = parsed;
      let tile = this.tilesObjects[id];
      if (x+tile.width - 1 > width) width = x + tile.width - 1;
      if (y+tile.height - 1 > height) height = y + tile.height - 1;

      flipX = (flipX === 1);
      flipY = (flipY === 1);
      all.push({x, y, rotation,flipX, flipY, layer, id});
    }

    return [all, width + 1, height + 1];
  }

  import(value) {
    this.level.value = value;
    
    this.clearTiles();
    [this.tiles, this.width, this.height] = this.parseImport(value);
    this.createBoard(this.width, this.height);

    this.loadBoard(this.tiles);
  }

  clearTiles() {
    this.tiles = [];
    this.tilesRoot.innerHTML = "";
    // this.loadBoard([]);
  }


  createBoard(width, height) {
    // this.clearTiles();
    this.widthInput.value = width;
    this.heightInput.value = height;
    [this.width, this.height] = [width, height];

    // document.body.style.setProperty("--size", `calc(${100 / height}vmin - 2px - (2rem / ${height}))`);
    document.body.style.setProperty("--map-width", width);
    document.body.style.setProperty("--map-height", height);
    this.tilemap.innerHTML = "";
    this.tilemap.append(this.tilesRoot);
    this.rows = [];
    for(let y = 0; y < height; y++) {
      let elementColumn = [];
      let row = document.createElement("div");
      row.classList.add("tile-row");
      this.tilemap.appendChild(row);
      for(let x = 0; x < width; x++) {
        let col = document.createElement("div");
        col.classList.add("tile-col");
        row.appendChild(col);
        elementColumn.push(col);
        
        // events
        col.addEventListener("mouseenter", e => { 
          if (!this.placeActive) return; 
          if (this.drag)  {
            this.tryPlace(x, y, this.activeTile);
            return;
          }
          this.placeGhost(x, y, this.activeTile)
        })
        col.addEventListener("mousedown", e => {         
          if (!this.placeActive) return; 
          this.tryPlace(x, y, this.activeTile);
        })
      } 
      
      this.rows.push(elementColumn);
      // board.push(boardRow);
    }
  }

  placeGhost(x, y, tileId) {
    [this.ghostX, this.ghostY] = [x, y];
    if (this.ghost) this.ghost.remove();
    let success = this.tryPlace(x, y, tileId, true);
    if (success) this.ghost = success;
  }

  registerTile(x,y,rotation, flipX, flipY, layer, id) {
    this.tiles.push({x,y,rotation, flipX, flipY, layer, id});
  }

  tryPlace(x, y, tileId, ghost = false) {
    let tile = this.tilesObjects[tileId];
    let [width, height] = this.rotatedDim(tile.width, tile.height, this.rotation);
    if (x + width > this.width ) return false;
    if (y + height > this.height ) return false;
    let layer = "layer" in tile ? tile.layer : 0; 
    
    let overlapping = this.getOverlappingTiles(x, y, width, height, layer);
    if (overlapping.length > 0) return false;


    if (!ghost) this.registerTile(x,y,this.rotation, this.flipX, this.flipY, layer, tileId);
    return this.addTile(x, y, this.rotation, this.flipX, this.flipY, layer, tileId, ghost);
  }

  getOverlappingTiles(x,y,w,h, layer) {
    let overlapping = [];
    let right = x + w;
    let bottom = y + h;
    for (let tile of this.tiles) {
      let tileSettings = this.tilesObjects[tile.id];
      let [tileWidth, tileHeight] = this.rotatedDim(tileSettings.width, tileSettings.height, tile.rotation);


      let a = {
        top:y,
        left:x,
        width:w,
        height:h,
      }
      let b = {
        top:tile.y,
        left:tile.x,
        width:tileWidth,
        height:tileHeight,
      }

      let tileLayer = "layer" in tile ? tile.layer : 0;

      // @from: https://stackoverflow.com/questions/57513036/bounding-box-of-multiple-overlapping-rectangles
      if (!(
        ((a.top + a.height-1) < (b.top)) ||
        (a.top > (b.top + b.height-1)) ||
        ((a.left + a.width-1) < b.left) ||
        (a.left > (b.left + b.width-1))
      ) && tileLayer === layer
      ) overlapping.push(tile);
    }
    return overlapping;
    // return [];
  }

  rotatedDim(width, height, rotation) {
    if (rotation % 2 === 1) [width, height] = [height, width];
    return [width, height];
  }
  
  removeTile(x,y, id) {
    console.log(this.tilesetTiles);
    for (let [tileId, tile] of Object.entries(this.tiles)) {
      // let tile = this.tiles[tileId];
      // console.log(tileId, this.tiles, tile);
      if (tile.x === x && tile.y === y) {
        
        console.log(tile);
        this.tiles.splice(tileId, 1);
      }
    }

    for (let element of this.tileElements) {
      console.log(element, id)
      if ("id" in element.dataset && element.dataset.id == id) {
        element.remove();
      }
    }


    this.export();

  }

  getId() {
    return Math.floor(Math.random() * 10000000);
  }

  getTile(x, y) {
    return this.rows[y][x];
  }

  addTile(x, y, rotation, flipX, flipY, layer, id, isGhost = false) {
    if (!(id in this.tilesObjects)) return;
    let tile = this.tilesObjects[id]; 
    let tileElement = document.createElement("div");
    let {width, height} = tile;
    // if (rotation % 2 === 1) [width, height] = [height, width];
    tileElement.classList.add("tile");
    tileElement.style.setProperty("--rotation", rotation);
    tileElement.style.setProperty("--tile", `url('${this.imageFolder}${tile.image}')` );
    tileElement.style.setProperty("--width", width );
    tileElement.style.setProperty("--height", height );
    tileElement.style.setProperty("--flip-x", flipX ? -1 : 1 );
    tileElement.style.setProperty("--flip-y", flipY ? -1 : 1 );
    tileElement.style.setProperty("--x", x );
    tileElement.style.setProperty("--y", y );
    let tileId = this.getId();
    tileElement.dataset.id = tileId;
    this.tileElements.push(tileElement);

    tileElement.addEventListener("click", e=> {
      if (this.eraseMode) this.removeTile(x, y, tileId);
    })

    let offset = Math.abs((width - height) / 2);
    if (width < height) {
      if (rotation % 2 === 1) {
        tileElement.style.setProperty("--offset-x", -offset );
        tileElement.style.setProperty("--offset-y", offset );
      } else {
      }
    } else {
      if (rotation % 2 === 1) {
        tileElement.style.setProperty("--offset-x", offset );
        tileElement.style.setProperty("--offset-y", -offset );
      } else {
        console.log("edge case");
      }
    }

    if (isGhost) tileElement.classList.add("is-ghost");

    this.tilesRoot.append(tileElement);

    if (!isGhost) this.export();
    

    return tileElement;
  }

  loadBoard(tiles) {
    for (let tileInfo of tiles) {
      let {x, y, rotation, flipX, flipY, layer, id} = tileInfo;
      this.addTile(x, y, rotation, flipX, flipY, layer, id);
    }
  }

}

