var ipc = require("electron").ipcRenderer;
const dialog = require("electron").remote.dialog;

const BrowserWindow = require('electron').remote.getCurrentWindow()

alert = function(txt) {
    dialog.showMessageBoxSync(BrowserWindow, {"message": txt, "type":"question"})
}
confirm = function(txt) {
    let retVal = dialog.showMessageBoxSync(BrowserWindow, {"message": txt, "type":"error", "buttons": ["OK", "Cancel"], "defaultId":0, "cancelId":1})
    if(retVal == 0) {
        return true;
    }
    else {
        return false;
    }
}

var imageFullPathArray = []
var currentImageIndex = 0

var ipcRequestFrom = "";

ipcRequestFrom = ipc.sendSync("EditorReady", "")

ipc.once("EditorOpenedSendDataResponse", function(event, data){
    imageFullPathArray = JSON.parse(data)
    console.log(imageFullPathArray)
    loadPageForImage()
})
console.log(ipcRequestFrom)
ipc.send(ipcRequestFrom, "")

function loadPageForImage() {
    // then empty the tags
    document.getElementById("tagsTextarea").value = "";
    // then ask the ipc for the meta contents on the image
    ipc.once("ReadFileMetaResponse", function(event, data){
        let metaContents = JSON.parse(data)
        console.log(metaContents)
        if(metaContents.Subject != undefined) {
            displayTags(metaContents.Subject)
        }
        else {
            displayTags(false)
        }
    })
    ipc.send("ReadFileMeta", imageFullPathArray[currentImageIndex])
    document.getElementById('image').setAttribute("src", imageFullPathArray[currentImageIndex])
}

var moveLeftBtn = document.getElementById("moveLeftBtn")
moveLeftBtn.addEventListener("click", function(){
    if(currentImageIndex > 0) {
        currentImageIndex = currentImageIndex -1
        loadPageForImage()
        moveLeftBtn.style.backgroundColor = "lime"
        setTimeout(function(){
            moveLeftBtn.removeAttribute("style")
        }, 400)
    }
    else {
        moveLeftBtn.style.backgroundColor = "red"
        setTimeout(function(){
            moveLeftBtn.removeAttribute("style")
        }, 400)
    }
})
var moveRightBtn = document.getElementById("moveRightBtn")
moveRightBtn.addEventListener("click", function(){
    if(currentImageIndex < imageFullPathArray.length-1) {
        currentImageIndex = currentImageIndex +1
        loadPageForImage()
        moveRightBtn.style.backgroundColor = "lime"
        setTimeout(function(){
            moveRightBtn.removeAttribute("style")
        }, 400)
    }
    else {
        moveRightBtn.style.backgroundColor = "red"
        setTimeout(function(){
            moveRightBtn.removeAttribute("style")
        }, 400)
    }
})

function displayTags(tags) {
    if(tags == false) {
        // then do nothing
    }
    else {
        // then join the tags together into a string with the \n character in between
        let tagsString = tags.join("\n")
        document.getElementById("tagsTextarea").value = tagsString;
    }
}

var addTagBtn = document.getElementById("addTagBtn")
addTagBtn.addEventListener("click", function(){
    addTagDialog()
})
function addTagDialog() {
    openModal()
    document.getElementById("autocompleteText").focus()
}

// autocomplete modal stuff
var autocompleteModal = document.getElementById("autocompleteModal")
function openModal() {
    autocompleteModal.style.display = "block"
    document.getElementById("autocompleteText").focus()
}
function closeModal() {
    autocompleteModal.style.display = "none"
    document.getElementById("autocompleteSuggestionsDiv").innerHTML = "";
    document.getElementById("autocompleteText").value = "";
}
var autocompleteModalClose = document.getElementById("close")
autocompleteModalClose.addEventListener("click", closeModal)

// the autocomplete bit
var allTagsString = ""
var allTagsArray = []
getAllTags();
function getAllTags() {
    // first request all of the tags from the ipc
    ipc.once("TagEditorGetTagsResponse", function(event, data){
        allTagsString = JSON.parse(data)
        // then get all of the tags as an array
        allTagsArray = allTagsString.split(",")
        autocomplete(document.getElementById("autocompleteText"), allTagsString)
    })
    ipc.send("TagEditorGetTags", "")
}

var results = []

function autocomplete(textField, tagsString) {
    // then get the results div where the suggestions will be placed
    let autocompleteSuggestionsDiv = document.getElementById("autocompleteSuggestionsDiv")

    // then clear it
    autocompleteSuggestionsDiv.innerHTML = "";

    // then get the text that the person has typed in
    let searchTerm = textField.value;

   
    
    results = allTagsArray.filter(function(tag){
        return typeof tag == 'string' && tag.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    })

    console.log(results)

    // then go through all of the results

    for(var i = 0; i <= results.length -1; i++) {
        // create the button
        let button = document.createElement("button")
        let buttonTextNode = document.createTextNode(results[i])
        button.appendChild(buttonTextNode)
        button.setAttribute("onclick", "selectedAutocompleteElement(" + i + ")")
        button.setAttribute("class", "button btn fullWidth")
        button.setAttribute("style", "font-size: 250%;")
        autocompleteSuggestionsDiv.appendChild(button)
    }
    
    let newButton = document.createElement("button")
    let newButtonTextNode = document.createTextNode("Create New Tag")
    newButton.appendChild(newButtonTextNode)
    newButton.setAttribute("onclick", "createNewTag()")
    newButton.setAttribute("class", "button btn fullWidth")
    newButton.setAttribute("style", "font-size: 250%; background-color:red;")
    let brtag = document.createElement("br")
    let brtag2 = document.createElement("br")
    autocompleteSuggestionsDiv.appendChild(brtag)
    autocompleteSuggestionsDiv.appendChild(brtag2)
    autocompleteSuggestionsDiv.appendChild(newButton)

    // then put an event listner on the textField
    textField.addEventListener("keyup", function(event){
        // then get the results div where the suggestions will be placed
        let autocompleteSuggestionsDiv = document.getElementById("autocompleteSuggestionsDiv")

        // then clear it
        autocompleteSuggestionsDiv.innerHTML = "";

        // then get the text that the person has typed in
        let searchTerm = textField.value;

       
        
        results = allTagsArray.filter(function(tag){
            return typeof tag == 'string' && tag.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        })

        console.log(results)

        // then go through all of the results

        for(var i = 0; i <= results.length -1; i++) {
            // create the button
            let button = document.createElement("button")
            let buttonTextNode = document.createTextNode(results[i])
            button.appendChild(buttonTextNode)
            button.setAttribute("onclick", "selectedAutocompleteElement(" + i + ")")
            button.setAttribute("class", "button btn fullWidth")
            button.setAttribute("style", "font-size: 250%;")
            autocompleteSuggestionsDiv.appendChild(button)
        }
        
        let newButton = document.createElement("button")
        let newButtonTextNode = document.createTextNode("Create New Tag")
        newButton.appendChild(newButtonTextNode)
        newButton.setAttribute("onclick", "createNewTag()")
        newButton.setAttribute("class", "button btn fullWidth")
        newButton.setAttribute("style", "font-size: 250%; background-color:red;")
        let brtag = document.createElement("br")
        let brtag2 = document.createElement("br")
        autocompleteSuggestionsDiv.appendChild(brtag)
        autocompleteSuggestionsDiv.appendChild(brtag2)
        autocompleteSuggestionsDiv.appendChild(newButton)

    })
}

function selectedAutocompleteElement(tagIndex) {
    // then call the add tag function and give it the tag name
    addTag(results[tagIndex])
}
function createNewTag() {
    let newTagName = document.getElementById("autocompleteText").value;
    if(confirm("Are you sure that you want to create a new tag called '" + newTagName + "'") == true) {
        // then check if there is already a tag called that
        if(allTagsArray.indexOf(newTagName) != -1) {
            // then there already is
            alert("There is already a tag called '" + newTagName + "', please use that one instead")
            document.getElementById("autocompleteText").focus()
        }
        else {
            // then request the latest set of all of the tags
            getAllTags()
            // then push the newTagName to the end of the list
            let newAllTagsArray = allTagsArray
            newAllTagsArray.push(newTagName)
            // then send a request to the ipc to save this
            ipc.once("TagEditorSaveTagsResponse", function(event, data){
                if(data != "Tags Saved Successfully, You May Close This Page Now") {
                    // then alert error
                    alert("There has been an error, please restart the application")
                }
                else {
                    // then request the latest set of the tags and open and close the modal
                    getAllTags()
                    document.getElementById("autocompleteText").value = newTagName;
                    autocomplete(document.getElementById("autocompleteText"), allTagsString)
                }
            })
            ipc.send("TagEditorSaveTags", JSON.stringify(newAllTagsArray))
        }
    }
}

function addTag(tag) {
    // then search and make sure the tag has not been used more than once
    let tagsTextarea = document.getElementById("tagsTextarea").value
    // then explode it into an array by removing the \n
    let currentTagsArray = tagsTextarea.split("\n")
    if(currentTagsArray[0] == "") {
        let thrw = currentTagsArray.shift()
    }
    console.log(currentTagsArray)

    if(currentTagsArray.indexOf(tag) != -1) {
        // then the tag has been duplicated so close the autocomplete box and bring up an alert
        closeModal()
        alert("You cannot use the same tag more than once")
    }
    else {
        // then it hasnt so append a new tag to the end of the current tags array
        currentTagsArray.push(tag)
        // then replace the tagsTextarea with the new values
        document.getElementById("tagsTextarea").value = currentTagsArray.join("\n")
    }
}

let saveTagsBtn = document.getElementById("saveTagsBtn")
saveTagsBtn.addEventListener("click", function(){
    saveTags()
})

function saveTags() {
    // first get all of the tags from the textarea
    let finalTagsString = document.getElementById("tagsTextarea").value
    let finalTagsArray = finalTagsString.split("\n")
    //// then explode the tagsArray into a string separated by a fslash
    //let writableTagsString = finalTagsArray.join("/")
    ipc.once("WriteFileMetaTagsResponse", function(event, data){
        if(data == true) {
            alert("Saved")
        }
        else {
            alert("Failed To Save")
        }
    })
    ipc.send("WriteFileMetaTags", JSON.stringify({ "tagsToWrite": finalTagsArray, "path": imageFullPathArray[currentImageIndex]}))

}

let deleteImageBtn = document.getElementById("deleteImageBtn")
deleteImageBtn.addEventListener("click", function(){
    if(confirm("Are You Sure That You Want To Delete This Image, It Will Be Placed In A Folder Called '!!!phototagger_deleted'") == true) {
        // then call the deleteImage function
        deleteImage()
    }
})

function deleteImage() {
    // then call the ipc to execute the fake delete
    ipc.once("DeleteImageFakeResponse", function(client, data){
        if(data) {
            // then as the file was successfully deleted then remove it from the array and leave the index as it is
            let thrw = imageFullPathArray.splice(currentImageIndex, 1)
            console.log(imageFullPathArray.length-1)
            console.log(currentImageIndex)
            console.log(imageFullPathArray)
            if(currentImageIndex > imageFullPathArray.length-1) {
                currentImageIndex--
            }
            loadPageForImage()
        }
        else {
            alert("File Was Not Deleted")
        }

    })
    ipc.send("DeleteImageFake", JSON.stringify({"imageToDelete": imageFullPathArray[currentImageIndex], "folderName": "!!!phototagger_deleted"}))
}

let reloadImgBtn = document.getElementById("reloadImgBtn")
reloadImgBtn.addEventListener("click", function(){
    loadPageForImage()
})