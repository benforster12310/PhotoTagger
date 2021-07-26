const { app, BrowserWindow } = require('electron')
const { dialog } = require('electron')
var ipc = require("electron").ipcMain;
const fs = require('fs');
const path = require('path');
const isImage = require("is-image")
var exiftool = require("exiftool-vendored").exiftool
// Change this path to your own tags csv file
var pathToTags = '\\\\BEN-COMPUTER\\homeshare\\PHOTOS\\!phototagger_files\\tags.csv'

if(require('electron-squirrel-startup')) return;

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }
  
  function handleSquirrelEvent() {
    if (process.argv.length === 1) {
      return false;
    }
  
    const ChildProcess = require('child_process');
    const path = require('path');
  
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
  
    const spawn = function(command, args) {
      let spawnedProcess, error;
  
      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {}
  
      return spawnedProcess;
    };
  
    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };
  
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus
  
        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers
  
        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);
  
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated
  
        app.quit();
        return true;
    }
  };

function createWindow (width, height, file, maximised) {
    const win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    
    if(maximised) {
        win.maximize()
    }
  
    win.loadFile(file)
    return win;
}
var mainWindow = null
var editorWindow = null

// when ready create the main window
app.whenReady().then(() => {
    mainWindow = createWindow(800, 600, "pages/index.html", true)
})

app.on('window-all-closed', function () {
    if(process.platform !== 'darwin') app.quit()
})

var fileOrFolder = ""

// then handle requests between the different pages
ipc.on("OpenFolderPopup", function(event, data) {
    fileOrFolder = "MultipleEditorOpenedSendData";
    var result = dialog.showOpenDialogSync({ properties: ["openDirectory"] })
    // then make sure that it is defined
    if(result == undefined || result == null) {
        event.sender.send("OpenFolderPopupResponse", "Prompt Was Cancelled")
    }
    else {
        filePath = result[0]
        // then search through the folder and get all of the items that are images
        imageArrayFullPaths = []
    
        fs.readdirSync(filePath, { withFileTypes:true }).forEach(file => {
            // then check if it is a file
            if(file.isFile()) {
                // then check if it is an image
                if(isImage(file.name)) {
                    // then add it to the fullPathsArray
                    imageArrayFullPaths.push(filePath + "\\" + file.name)
                 }
                else {
                    // ignore it
                }
            }
            else {
                // ignore it
            }
        })
        if(imageArrayFullPaths.length == 0) {
            event.sender.send("OpenFolderPopupResponse", "No Images In Folder")
            return
        }
        else {
            // then open a new window
            editorWindow = createWindow(800, 600, "pages/editor.html", true)
            event.sender.send("OpenFolderPopupResponse", true)

            ipc.on("MultipleEditorOpenedSendData", function(event, data){
                event.sender.send("EditorOpenedSendDataResponse", JSON.stringify(imageArrayFullPaths))
            })
        }

    }

})

ipc.on("OpenFilePopup", function(event, data) {
    fileOrFolder = "SingleEditorOpenedSendData"
    var result = dialog.showOpenDialogSync({ properties: ["openFile"] })
    // then make sure that it is defined
    if(result == undefined || result == null) {
        event.sender.send("OpenFilePopupResponse", "Prompt Was Cancelled")
    }
    else {
        // then open a new window
        editorWindow = createWindow(800, 600, "pages/editor.html", true)
        event.sender.send("OpenFilePopupResponse", true)
        let imageArrayFullPaths = result
        console.log(result)
        ipc.on("SingleEditorOpenedSendData", function(event, data){
            event.sender.send("EditorOpenedSendDataResponse", JSON.stringify(imageArrayFullPaths))
        })
    }

})

ipc.on("EditorReady", function(event, data){
    event.returnValue = fileOrFolder;
})

ipc.on("ReadFileMeta", function(event, data){
    exiftool.read(data).then((tags) => event.sender.send("ReadFileMetaResponse", JSON.stringify(tags))).catch((err) => event.sender.send("ReadFileMetaResponse", JSON.stringify(["ReadFileMeta has failed", err])))
})

ipc.on("WriteFileMetaTags", function(event, data){
    let dataObject = JSON.parse(data)
    exiftool.write(dataObject.path, {"Subject": dataObject.tagsToWrite}, ["-overwrite_original"]).then(event.sender.send("WriteFileMetaTagsResponse", true)).catch(function(err){ event.sender.send("WriteFileMetaTagsResponse", false)})
})





// tag editor
ipc.on("OpenTagEditor", function(event, data){
    // then create a new window and tell it to load tagEditor.html
    createWindow(800, 600, "pages/tagEditor.html", true)
})

ipc.on("TagEditorGetTags", function(event, data){
    // then read the JSON from the tags file
    let content = fs.readFileSync(pathToTags, "utf-8")
    event.sender.send("TagEditorGetTagsResponse", JSON.stringify(content))
})

ipc.on("TagEditorSaveTags", function(event, data){
    tagsArray = JSON.parse(data)
    tagsString = tagsArray.join(",")
    try {
        fs.writeFileSync(pathToTags, tagsString)
        event.sender.send("TagEditorSaveTagsResponse", "Tags Saved Successfully, You May Close This Page Now")
    }
    catch {
        event.sender.send("TagEditorSaveTagsResponse", "Tags Could Not Be Saved, Please Ensure The File At " + pathToTags + " Is Available To You")
    }
})

ipc.on("DeleteImageFake", function(event, data){
    let dataObject = JSON.parse(data)
    let newDirPath = path.dirname(dataObject.imageToDelete) + "\\" + dataObject.folderName
    let newPath = path.dirname(dataObject.imageToDelete) + "\\" + dataObject.folderName + "\\" + path.basename(dataObject.imageToDelete)
    if(fs.existsSync(newDirPath)) {
        // then as the folder exists then move the file to it
        fs.rename(dataObject.imageToDelete, newPath, function(err) {
            if(err) {
                event.sender.send("DeleteImageFakeResponse", false)
            }
            else {
                event.sender.send("DeleteImageFakeResponse", true)
            }
        })
    }
    else {
        // then make the directory
        fs.mkdirSync(newDirPath)
        // then move the file to it
        fs.rename(dataObject.imageToDelete, newPath, function(err) {
            if(err) {
                event.sender.send("DeleteImageFakeResponse", false)
            }
            else {
                event.sender.send("DeleteImageFakeResponse", true)
            }
        })
    }
})