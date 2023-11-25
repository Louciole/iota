import {initTheme} from "./theme.mjs";
import {initDrag} from "./dragHandler.mjs";

initTheme()
initDrag()
initMenu()

function initMenu(){
    const flyingMenu = document.querySelector('#flying-menu')

    document.onclick = function (){
        console.log("clicked")
        if (!event.target.classList.contains("selectable")){
            flyingMenu.style.display="none";
        }else{
            console.log("show")
            flyingMenu.style.display="flex";
            if(event.clientY+flyingMenu.getBoundingClientRect().height < window.innerHeight){
                flyingMenu.style.top=event.clientY.toString()+"px";
                flyingMenu.style.left=event.clientX.toString()+"px";
            }else{
                flyingMenu.style.top=(event.clientY-flyingMenu.getBoundingClientRect().height+5).toString()+"px";
                flyingMenu.style.left=event.clientX.toString()+"px";
            }
        }
    }
}
