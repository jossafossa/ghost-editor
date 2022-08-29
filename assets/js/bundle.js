import Editor from "./editor.js";


function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}    

docReady(e => {
  
  window.editor = new Editor();


})




// scroll drag
const ele = document.querySelector('.tilemap');
ele.style.cursor = 'grab';

let pos = { top: 0, left: 0, x: 0, y: 0 };

const mouseDownHandler = function (e) {
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';

    pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
  if (!window.editor.placeActive) {

    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;
    
    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  }
};

const mouseUpHandler = function () {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

// Attach the handler
ele.addEventListener('mousedown', mouseDownHandler);


let sidebarButtons = document.querySelectorAll(".sidebar-button");
for (let button of sidebarButtons) {
  let sidebar = button.closest(".sidebar");
  if (sidebar) {
    button.addEventListener("click", e => {
      sidebar.classList.toggle("is-open");
    })
  }
}

