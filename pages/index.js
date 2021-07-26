var ipc = require("electron").ipcRenderer;
const dialog = require("electron").remote.dialog;

const BrowserWindow = require('electron').remote.getCurrentWindow()

alert = function(txt) {
    dialog.showMessageBoxSync(BrowserWindow, {"message": txt, "type":"error"})
}

var openFolderBtn = document.getElementById('openFolderBtn')
openFolderBtn.addEventListener('click', function(){
    openFolder()
})
function openFolder() {
    ipc.once("OpenFolderPopupResponse", function(event, data){
        if(data != true) {
            alert(data)
        }
    })
    ipc.send("OpenFolderPopup", "")
}

var openFileBtn = document.getElementById('openFileBtn')
openFileBtn.addEventListener('click', function(){
    openFile()
})
function openFile() {
    ipc.once("OpenFilePopupResponse", function(event, data){
        alert(data)
    })
    ipc.send("OpenFilePopup", "")
}

var openTagEditorBtn = document.getElementById('openTagEditorBtn')
openTagEditorBtn.addEventListener('click', function(){
    openTagEditor()
})
function openTagEditor() {
    ipc.send("OpenTagEditor", "")
}