import { initTheme } from "./theme.mjs";
import { initDrag } from "./dragHandler.mjs";
import { goTo } from "./framework/navigation.mjs";

initTheme()
initDrag()
initMenu()
goTo('toolbox-content','toolbox-snippets')

function initMenu() {
    const flyingMenu = document.querySelector('#flying-menu')
    document.onclick = function () {
        console.log("clicked",event.target,event.currentTarget)
        if (!event.target.classList.contains("selectable")) {
            if(event.target !== event.currentTarget){
                return
            }
            flyingMenu.style.display = "none";
        } else {
            flyingMenu.style.display = "flex";
            if (event.clientY + flyingMenu.getBoundingClientRect().height < window.innerHeight) {
                flyingMenu.style.top = event.clientY.toString() + "px";
                flyingMenu.style.left = event.clientX.toString() + "px";
            } else {
                flyingMenu.style.top = (event.clientY - flyingMenu.getBoundingClientRect().height + 5).toString() + "px";
                flyingMenu.style.left = event.clientX.toString() + "px";
            }

        }
    }
}

function propertyChanged(value,property){
    //TODO connect with model
    console.log("property changed")
}
window.propertyChanged = propertyChanged
