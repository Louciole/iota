
const SNIPPETS = {
    "btn": "<div class='btn selectable'>Magifique bouton</div>"
}
const DRAG_GHOST = document.querySelector("#drag-ghost")
const DOM_OVERLAY = document.querySelector("#viewport-overlay")
const PROXIMITY_THRESHOLD = "0.5rem"

//TODO beginning of the technical debt
let animationFrameRequested = false
let lastTargeted
let lastSnapZone
//TODO refactor END

window.onSnippetDrag = onSnippetDrag;
window.allowSnippetDrop = allowSnippetDrop;
window.dropSnippet = dropSnippet;

export function initDrag(){
    document.addEventListener("drag",  onDrag);
    lastTargeted = null
    lastSnapZone = null
    document.addEventListener("dragend",  onDragEnd);
}

function onDrag(e){
    const targeted = document.elementFromPoint(e.clientX, e.clientY)

    //si on est au-dessus d'un enfant de viewport
    if (targeted.closest("#viewport")){
        if( lastTargeted !== targeted){
            lastTargeted = targeted
            if(lastSnapZone){
                lastSnapZone.remove()
            }
            const boundingRect= targeted.getBoundingClientRect()
            console.log(targeted,boundingRect)
            const SNAP_ZONE = document.createElement("div")
            SNAP_ZONE.classList.add("snap-zone")
            SNAP_ZONE.innerHTML = "<div>+</div>"
            const direction = getElementDirection(SNAP_ZONE)
            SNAP_ZONE.classList.add(direction)
            const offset = {"x":0,"y":0}
            if (direction === "horizontal"){ //TODO  add a dict associating a direction with min max ... coordonates to have only one logic
                // si proche bordure bas
                    // => insert after
                    // => full size bar
                // sinon proche bordure haut
                    // => insert before
                    // => full size bar
                // si vide
                    // => insert inside (last)
                    // => full size bar
                // sinon si premiere moitié
                    // => insert as a first child
                    // si wrap => first child size
                    // sinon => full size bar
                // sinon si seconde moitié
                    // => insert as a last child
                    // si wrap => last child size
                    // sinon => full size bar
                SNAP_ZONE.style.width=`${boundingRect.width}px`
                const targetChildBox = targeted.lastElementChild.getBoundingClientRect()
                //TODO insert in between and before ?
                offset.y = targetChildBox
            }else{
                SNAP_ZONE.style.height=`${boundingRect.height}px`
            }

            SNAP_ZONE.style.top=`${offset.y}px`
            SNAP_ZONE.style.left=`${boundingRect.x + offset.x}px`
            lastSnapZone=SNAP_ZONE
            DOM_OVERLAY.appendChild(SNAP_ZONE)
        }
    }

    if (!animationFrameRequested){
        animationFrameRequested = true
        requestAnimationFrame(()=> {
                DRAG_GHOST.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
                console.log(e.clientX,e.clientY)
                animationFrameRequested = false
            }
        )
    }
}

function onDragEnd(e){
    DRAG_GHOST.style.display = "none"
    if(lastSnapZone){
        lastSnapZone.remove()
    }
}

function onSnippetDrag(e) {
    e.dataTransfer.setData("snippet", e.target.classList[1]);
    DRAG_GHOST.style.display = "flex"
    event.dataTransfer.setDragImage(event.target, -99999, -99999);
}

function allowSnippetDrop(e) {
    e.preventDefault();
}



function dropSnippet(e) {
    e.preventDefault();

    const snippet = e.dataTransfer.getData("snippet");
    const node = document.createElement('div')
    node.innerHTML = SNIPPETS[snippet]
    e.target.appendChild(node);
}

function getElementDirection(element){
    return('horizontal')
}


