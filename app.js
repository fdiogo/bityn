const {app, BrowserWindow, nativeImage, dialog} = require('electron');
const fs = require('fs');
const path = require('path');
const readTrackMetadata = require('musicmetadata');

const lib = path.join(__dirname, 'lib');
const images = path.join(__dirname, 'images');
const templates = path.join(__dirname, 'templates');
const models = path.join(lib, 'models.js');
const DEFAULT_IMAGE = path.join(images, 'note.png');

const {Track, Album} = require(models);

app.on('ready', () => {
    const window = new BrowserWindow();
    const folders = new Set([app.getPath('music')]);
    const acceptedExtensions = /\.mp3$/;

    window.loadURL('file://' + templates + '/window-main.html');
    window.webContents.on('did-finish-load', function() {
        const selectedFolders = dialog.showOpenDialog(window, {
            title: 'Music folder',
            defaultPath: app.getPath('music'),
            properties: ['openDirectory']
        });
        folders.add.apply(folders, selectedFolders);

        const sendTracks = tracks => window.webContents.send('directory-loaded', tracks);
        for(folder of folders)
            loadDirectory(folder, acceptedExtensions, sendTracks);
    });
});

/**
 * @callback directoryCallback
 * @param {Track[]} - The loaded audio files metadata.
 */

/**
 * @callback eachTrackCallback
 * @param {Track} - The loaded track metadata
 */

/**
 * Loads all the acceptable files metadata from a directory.
 * @param {string} folderPath               - The full path to the directory.
 * @param {regex} [acceptedExtensions]      - The regex to filter file extensions.
 * @param {directoryCallback} [callback]    - The function called with all the loaded audio files metadata.
 * @param {eachTrackCallback} [each]        - The function to be called on each loaded track metadata.
 */
function loadDirectory(folderPath, acceptedExtensions, callback, each) {
    fs.readdir(folderPath, function(err, filesNames) {
        if(acceptedExtensions)
            filesNames = filesNames.filter(fileName => acceptedExtensions.test(fileName));

        const loadedFiles = [];
        for(let fileName of filesNames) {
            let filePath = path.join(folderPath, fileName);
            loadTrackMetadata(filePath, track => {
                loadedFiles.push(track);
                if(each)
                    each(track);
                if(callback && loadedFiles.length == filesNames.length)
                    callback(loadedFiles);
            });
        }
    });
};

/**
 * @callback trackMetadataCallback
 * @param {Track} - The track metadata.
 */

/**
 * Loads an audio file metadata.
 * @param {string} filePath                 - The full path to the audio file.
 * @param {trackMetadataCallback} callback  - The function called with the loaded file metadata.
 */
function loadTrackMetadata(filePath, callback) {
    const fileReadStream = fs.createReadStream(filePath);
    readTrackMetadata(fileReadStream, function(err, metadata) {
        metadata.path = filePath;
        const track = Track.fromMetadata(metadata);
        callback(track);
    });
}
