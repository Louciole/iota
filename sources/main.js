snippets = {
    "btn": "<div class='btn'>Magifique bouton</div>"
}

function drag(e) {
    e.dataTransfer.setData("snippet", e.target.classList[1]);
    let img = document.createElement("img");
    img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
    e.dataTransfer.setDragImage(img, 0, 0);
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();

    const snippet = e.dataTransfer.getData("snippet");
    const node = document.createElement('div')
    node.innerHTML = snippets[snippet]
    e.target.appendChild(node);
}
