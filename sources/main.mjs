import {initTheme} from "./theme.mjs";

const SNIPPETS = {
    "btn": "<div class='btn'>Magifique bouton</div>"
}
const DRAG_GHOST = document.querySelector("#drag-ghost")
let animationFrameRequested = false


initTheme()
initDrag()

function onDrag(e){
    if (!animationFrameRequested){
        animationFrameRequested = true
        requestAnimationFrame(   ()=> {
                DRAG_GHOST.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
                console.warn(e.clientX,e.clientY)
                animationFrameRequested = false
            }
        )
    }
}

function onDragEnd(e){
    DRAG_GHOST.style.display = "none"
}

function initDrag(){
    document.addEventListener("drag",  onDrag);
    document.addEventListener("dragend",  onDragEnd);
}

function onSnippetDrag(e) {
    e.dataTransfer.setData("snippet", e.target.classList[1]);
    DRAG_GHOST.style.display = "flex"
    event.dataTransfer.setDragImage(event.target, -99999, -99999);
}

window.onSnippetDrag = onSnippetDrag;

function allowSnippetDrop(e) {
    e.preventDefault();
}

window.allowSnippetDrop = allowSnippetDrop;

function dropSnippet(e) {
    e.preventDefault();

    const snippet = e.dataTransfer.getData("snippet");
    const node = document.createElement('div')
    node.innerHTML = SNIPPETS[snippet]
    e.target.appendChild(node);

}

window.dropSnippet = dropSnippet;
