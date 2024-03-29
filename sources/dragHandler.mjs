import { convertRemToPixels } from "./utils.mjs";

const SNIPPETS = {
    "btn": "<button class='selectable'>Magifique bouton</button>",
    "a": "<a class='selectable'></a>",
    "p": "<p class='selectable'>Un magnifique paragraphe</p>",
    "heading": "<h1 class='selectable'>Titre</h1>",
    "hr": "<hr class='selectable'>",
    "div": "<div class='selectable'></div>"
}
const DRAG_GHOST = document.querySelector("#drag-ghost")
const DOM_OVERLAY = document.querySelector("#viewport-overlay")
const PROXIMITY_THRESHOLD = convertRemToPixels(0.5)

//TODO beginning of the technical debt
let animationFrameRequested = false
let lastTargeted
let lastSnapZone
//TODO refactor END

window.onSnippetDrag = onSnippetDrag;
window.allowSnippetDrop = allowSnippetDrop;
window.dropSnippet = dropSnippet;

export function initDrag() {
    document.addEventListener("drag", onDrag);
    lastTargeted = null
    lastSnapZone = null
    document.addEventListener("dragend", onDragEnd);
}

function onDrag(e) {
    document.body.addEventListener('dragover', e => {
        const targeted = document.elementFromPoint(e.clientX, e.clientY)

        //si on est au-dessus d'un enfant de viewport
        if (targeted.closest("#viewport")) {
            const boundingRect = targeted.getBoundingClientRect()
            const HALF_HEIGHT = boundingRect.top + (boundingRect.bottom - boundingRect.top) / 2
            const HALF_WIDTH = boundingRect.left + (boundingRect.right - boundingRect.left) / 2
            console.log(targeted, boundingRect)
            const direction = getElementDirection(targeted)

            if (direction === "horizontal") { //TODO  add a dict associating a direction with min max ... coordonates to have only one logic
                // si proche bordure bas
                console.log(e.clientY, PROXIMITY_THRESHOLD, boundingRect, targeted)
                if (e.clientY + PROXIMITY_THRESHOLD >= boundingRect.bottom) {
                    addSnapZone(boundingRect.x, boundingRect.bottom, 'horizontal', boundingRect.width)
                    console.log("1 - ADD AFTER")
                } else if (e.clientY - PROXIMITY_THRESHOLD <= boundingRect.top) {
                    // sinon proche bordure haut
                    addSnapZone(boundingRect.x, boundingRect.top, 'horizontal', boundingRect.width)
                    console.log("2 - ADD BEFORE")
                } else if (targeted.childElementCount === 0) {
                    // si vide
                    addSnapZone(boundingRect.x, HALF_HEIGHT, 'horizontal', boundingRect.width)
                    console.log("3 - ADD INSIDE")
                } else if (e.clientY <= HALF_HEIGHT) {
                    // sinon si premiere moitié
                    addSnapZone(boundingRect.x, HALF_HEIGHT, 'horizontal', targeted.getBoundingClientRect().width)
                    console.log("4 - ADD INSIDE FIRST")
                } else if (e.clientY > HALF_HEIGHT) {
                    // sinon si seconde moitié
                    addSnapZone(boundingRect.x, HALF_HEIGHT, 'horizontal', targeted.getBoundingClientRect().width)
                    console.log("5 - ADD INSIDE LAST")
                }
            } else {
                //vertical
            }
        }

        if (!animationFrameRequested) {
            animationFrameRequested = true
            requestAnimationFrame(() => {
                    DRAG_GHOST.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
                    animationFrameRequested = false
                }
            )
        }
    }, {once: true});// is it stupid ? yes -- is it useless also yes but it's made to get cursor coordinates on firefox because they don't want to fix this bug since 2009
}

function onDragEnd(e) {
    DRAG_GHOST.style.display = "none"
    if (lastSnapZone) {
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
    e.target.insertAdjacentHTML("beforeend", SNIPPETS[snippet])
}

function getElementDirection(element) {
    return ('horizontal')
}

function addSnapZone(x, y, mode = 'horizontal', size) {
    if (lastSnapZone) {
        lastSnapZone.remove()
    }
    //TODO ADD GESTION FIRST ELEMENT LAST ELEMENT
    const SNAP_ZONE = document.createElement("div")
    SNAP_ZONE.classList.add("snap-zone")
    SNAP_ZONE.innerHTML = '<div>+</div>'
    SNAP_ZONE.classList.add(mode)
    SNAP_ZONE.style.top = `${y}px`
    SNAP_ZONE.style.left = `${x}px`
    if (mode === 'horizontal') {
        SNAP_ZONE.style.width = `${size}px`
    } else if (mode === 'vertical') {
        SNAP_ZONE.style.height = `${size}px`
    }
    lastSnapZone = SNAP_ZONE
    DOM_OVERLAY.appendChild(SNAP_ZONE)
}
