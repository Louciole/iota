import global from "./global.mjs";
import {addElement, deleteElement, pushElement, setElement} from "./sakura.mjs";
import {displayNotif, postWS} from "../main.mjs";
import {handleMessageGroup, loadUsers} from "../crud.mjs";
import {xhr} from "./templating.mjs";

const WEBSOCKETS = "ws://localhost:9888"

export function initWebSockets(){
    global.state.socket = new WebSocket(WEBSOCKETS);

    global.state.socket.onopen = function(event) {
        console.log("Connection opened to Python WebSocket server!");
        const message = {"type" : 'register', "uid": global.user.id};
        global.state.socket.send(JSON.stringify(message));
    };

    global.state.socket.onmessage = function(event) {
        console.log("Received message from Python server:", event.data);
        const message = JSON.parse(event.data)
        switch (message.type){
            case "register_request":
                //TODO handle multiserver xhr with the received servID

                const effect = function (){
                    global.state.clientID = JSON.parse(this.responseText)
                    postWS()
                }

                xhr("authWS?connectionId=".concat(message.connectionId),effect)
                break
            case "notif":
                switch (message.content.type){
                    case "message":
                        const currentDate = new Date()
                        const timestamp = currentDate.getTime()
                        message.content.content["timestamp"] = timestamp
                        if(message.content.content.place === global.state.activeConv){
                            handleMessageGroup(message.content.content)
                            pushElement('global.convs['.concat(message.content.content.place,'].messages'),message.content.content)
                        }else{
                            displayNotif(message.content)
                        }
                        break;
                    case "friend_request":
                        loadUsers([message.content.content["kopinprincipal"]])
                        pushElement('global.user.invitations', message.content.content)
                        displayNotif(message.content)
                        break;
                    case "accepted_request":
                        loadUsers([message.content.content["kopinsecondaire"]])
                        pushElement('global.user.friends', message.content.content)
                        for(let i in global.user.invitations){
                            const request = global.user.invitations[i]
                            if (request.id === message.content.content.id){
                                deleteElement("global.user.invitations", i)
                                break
                            }
                        }
                        break;
                    case "added_conv":
                        addElement('global.convs', message.content.content)
                        break;
                    case "update_status":
                        if (message.content.content.id === global.user.id){
                            setElement('global.user.status', message.content.content.status)
                        }
                        setElement('global.users['.concat(message.content.content.id,"].status"), message.content.content.status)
                        break;
                    case "typing":
                        if(global.state.activeConv === message.content.conv){
                            const box = document.getElementById("typing-name")
                            box.parentElement.style.display="flex";
                            // todo handle multiple names
                            box.innerHTML = global.users[message.content.uid].display
                            setTimeout(() => box.parentElement.style.display="none", 5000)
                        }
                        break
                    case "edit_conv":
                        if (message.content.item === "name"){
                            setElement('global.convs['+message.content.id+'].name', message.content.content)
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

    };

    global.state.socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };
}
