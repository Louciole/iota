const SNIPPETS = {
    "btn": "<div class='btn'>Magifique bouton</div>"
}

function onSnippetDrag(e) {
    e.dataTransfer.setData("snippet", e.target.classList[1]);
    let img = document.createElement("img");
    img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
    e.dataTransfer.setDragImage(img, 0, 0);
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
