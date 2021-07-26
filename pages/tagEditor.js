var ipc = require("electron").ipcRenderer;

var tagsArray = []

ipc.once("TagEditorGetTagsResponse", function(event, data){
    tagsArray = JSON.parse(data).split(",")
    loadTags()
})
ipc.send("TagEditorGetTags", "")

function loadTags() {
    // then load the tags
    tagsString = tagsArray.join("\n")
    document.getElementById("tagsTextarea").value = tagsString;
}

var saveChangesBtn = document.getElementById("saveChangesBtn")
saveChangesBtn.addEventListener("click", function(){
    saveTags()
})
function saveTags() {
    // then get the tags string
    tagsString = document.getElementById('tagsTextarea').value;
    tagsArray = tagsString.split("\n")
    // then send a request to the ipc to save this
    ipc.once("TagEditorSaveTagsResponse", function(event, data){
        alert(data)
    })
    ipc.send("TagEditorSaveTags", JSON.stringify(tagsArray))
}