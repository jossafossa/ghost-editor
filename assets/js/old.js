let loadButton = document.querySelector("#load");
let widthInput = document.querySelector("#amountX");
let heightInput = document.querySelector("#amountY");
let tilemap = document.querySelector(".tilemap");
let tileset = document.querySelector(".tileset");
let importButton = document.querySelector("#import");
let level = document.querySelector("#level");
let heroPathButton = document.querySelector("#create-hero-path-button");
let heroPathActive = false;
let selectedTile;
let board = [];
let width = 7;
let height = 10;
let imageFolder = "tiles/";
let drag = false;
let body = document.body;
let columns = [];
let heroPath = [];
let prevX = -1;
let prevY = -1;

// disable drag 
function noDrag(event) {
  event.preventDefault();
}
document.addEventListener('dragstart',noDrag,true);

let defaultLevel = `10 10
+ _ _ _ _ _ _ _ _ +
] G . . . . . , . [
] . . . ╔ ▄ ╗ . . [
] = = . ║ E ║ . . [
] , . . ║ | ║ . . [
] . . . v | . , . [
] . . . ║ | . . . [
] . . . . | , . . [
] . . P . | . . H [
+ - - - - - - - - +
-1 0
-1 0
-1 0
-1 0
-1 0
-1 0
-1 0
0 -1
0 -1
0 -1
0 -1
0 -1
0 -1
0 -1`;

loadButton.addEventListener("click", e => {
  width = parseInt(widthInput.value);
  height = parseInt(heightInput.value);
  heroPath = [];
  createBoard(width, height);
  updateBoard();
})

function loadLevel(str) {
  heroPath = [];
  let bottom = str.split("\n");
  let header = bottom.shift();
  header = header.split(" ");
  width = parseInt(header[0]);
  height = parseInt(header[1]);
  rows = bottom.slice(0, height);
  let heroPos = [];
  console.log(rows);
  createBoard(width, height);
  for (let [y, row] of Object.entries(rows)) {
    let items = row.split(" ");
    console.log(items);
    for (let [x, item] of Object.entries(items)) {
      console.log(item);
      let tile = tiles[item];
      selectedTile = {key: item, tile};
      x = parseInt(x);
      y = parseInt(y);
      let index = x + y * rows.length;
      if (index < columns.length) {
        let col = columns[index]; 
        setTile(col, x, y);
        if (item == "H") {
          heroPos = [x, y];
        }
      }
      
    }
  }
  console.log(bottom.length > height);

  // hero path
  if (bottom.length > height) {
    console.log(bottom);
    let hp = bottom.slice(height, bottom.length);
    let x = heroPos[0];
    let y = heroPos[1];
    let prevX = heroPos[0];
    let prevY = heroPos[1];
    // hero path
    for (let hprow of hp) {

      if (heroPos.length > 0 && hp.length > 0) {
        hprow = hprow.split("\n");

        for (let path of hprow) {
          let _items = path.split(" ");
          _items = _items.reverse();
          let items = [];
          for (let item of _items) {
            items.push(parseInt(item));
          }

          let newX = prevX + items[0];
          let newY = prevY + items[1];
          
          let index = newX + newY * rows.length;
          let col = columns[index];
          
          prevX = newX;
          prevY = newY; 

          console.log(newX, newY, col);  
          col.classList.add("hero-path"); 
          // items = items.reverse();


          
          heroPath.push(items);
        }
      }
    }
  }
  updateBoard();
}

importButton.addEventListener("click", e => {
  loadLevel(level.value);
})

body.addEventListener("mousedown", e => {
  drag = true;
  console.log(drag);
})

body.addEventListener("mouseup", e => {
  drag = false;
  console.log(drag);
})


function createBoard(width, height) {
  console.log(width, height);
  body.style.setProperty("--size", `calc(${100 / height}vmin - 2px - (2rem / ${height}))`);
  board = [];
  tilemap.innerHTML = "";
  columns = [];
  for(let y = 0; y < height; y++) {
    let row = document.createElement("div");
    row.classList.add("tile-row");
    tilemap.appendChild(row);
    let boardRow = [];
    for(let x = 0; x < width; x++) {
      
      let col = document.createElement("div");
      col.classList.add("tile-col");
      row.appendChild(col);
      columns.push(col);
      
      boardRow.push(".");
      col.addEventListener("mousemove", e => { console.log(heroPathActive); if (drag && !heroPathActive) setTile(col, x, y)})
      col.addEventListener("click", e => {if (!heroPathActive) setTile(col, x, y)})
    } 
    board.push(boardRow);
  }
  console.log(columns);
}

function setTile(col, x, y) {
  console.log(selectedTile);
  col.dataset.tile=selectedTile.key;
  board[y][x] = selectedTile.key;
  console.log(col);
  if (selectedTile.tile !== "empty.png") {
    col.innerHTML = "<img src=" + imageFolder + selectedTile.tile + ">";
    } else {
      col.innerHTML = "";
    }
    updateBoard();
}

let tiles = {
  ".": "empty.png",
  "╔": "tilemap_22.png",
  "╗": "tilemap_21.png",
  "║": "tilemap_20.png",
  "▄": "tilemap_18.png",
  "╚": "tilemap_23.png",
  "╝": "tilemap_19.png",
  "═": "tilemap_16.png",
  "█": "tilemap_24.png",
  // "~": "tilemap_17.png",
  // "S": "tilemap_25.png",
  "_": "tilemap_02.png",
  "-": "tilemap_04.png",
  "[": "tilemap_03.png",
  "]": "tilemap_01.png",
  "|": "tilemap_07.png",
  "=": "tilemap_06.png",
  "+": "tilemap_00.png",
  // "K": "tilemap_15.png",
  // "D": "tilemap_12.png",
  // "B": "tilemap_13.png",
  ",": "tilemap_27.png",
  "E": "tilemap_14.png",
  "G": "tilemap_26.png",
  "H": "hero.png",
  "P": "player.png",
  "v": "tilemap_34.png",
  "^": "tilemap_32.png",
  ">": "tilemap_33.png",
  "<": "tilemap_31.png",
}
let tileElements = [];
for (let [key, tile] of Object.entries(tiles)) {
  let tileElement = document.createElement("div");
  let tileImage = document.createElement("img");
  tileElements.push(tileElement);
  // console.log(key, tile);
  tileImage.src = imageFolder + tile;
  if (tile == "empty.png") {
    tileElement.classList.add("is-empty");
  }
  tileElement.appendChild(tileImage);
  tileset.appendChild(tileElement);
  tileElement.addEventListener("click", e => {
    disablePath();
    tileElements.forEach(e => e.classList.remove("is-active"))
    tileElement.classList.add("is-active");
    selectedTile = {key, tile};
    console.log(selectedTile);
  })
}

function updateBoard() {
  let value = width + " " + height + "\n";
  for (let y in board) {
    let row = board[y];
    let strRow = "";
    for (let col of row) {
      strRow += `${col} `;
    }
    strRow = strRow.trim();
    value += strRow;

    // console.log(y, board.length);
    if (y < board.length - 1) {
      value += '\n';
    }
  }
  if (heroPath.length > 0) {
    value += "\n";
    for (let index in heroPath) {
      let path = heroPath[index];
      path = path.reverse();
      let row = path.join(" ");
      row = row.trim();
      value += row;
      if (index < heroPath.length - 1) {
        value+= '\n'
      }
    }
  }
  // console.log(level);
  level.value = value;
}

loadLevel(defaultLevel);


heroPathButton.addEventListener("click", e => {
  heroPathActive = !heroPathActive;
  if (heroPathActive) {

    heroPathButton.classList.add("is-active");
    let heroPathDrag = false;
    
    for (let index in columns) {
      let col = columns[index];
      col.addEventListener("mousedown", e => {
        if (!heroPathDrag) {

          if (col.dataset.tile == "H") {
          let x = parseInt(index / width);
          let y = index % width; 
          prevX = x;
          prevY = y;
            heroPath = [];
            resetPath();
            heroPathDrag = true;
          }
        }
      })
      col.addEventListener("mouseup", e => {
        if (heroPathActive) {

          if (col.dataset.tile == "G") {
            updateBoard();
            savePath();
          } else {
            resetPath();
          }
          console.log("mouseup", heroPathDrag);
        }
        heroPathDrag = false;
      })
      col.addEventListener("mousemove", e => {
        let x = parseInt(index / width);
        let y = index % width; 
        if (heroPathDrag && !(prevX == x && prevY == y)) {

          let offsetX = x - prevX;
          let offsetY = y - prevY;
          prevX = x;
          prevY = y;
          heroPath.push([offsetY, offsetX]);
          col.classList.add("hero-path");
        }
      })
    }
  } else {

    heroPathButton.classList.remove("is-active");
  }

})

function resetPath() {
  for (let col of columns) {
    col.classList.remove("hero-path");
  }
}

function disablePath() {
  heroPathActive = false;
  heroPathButton.classList.remove("is-active");
}

function savePath() {
  alert("hero path created");
  heroPathActive = false;
  heroPathButton.classList.remove("is-active");
}