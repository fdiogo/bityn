const {app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const readTrackMetadata = Promise.promisify(require('musicmetadata'));

const lib = path.join(__dirname, 'lib');
const images = path.join(__dirname, 'images');
const templates = path.join(__dirname, 'templates');
const models = path.join(lib, 'models.js');

const {Track, Album} = require(models);

app.on('ready', () => {
    const folders = new Set([app.getPath('music')]);
    const acceptedExtensions = /\.mp3$/;

    const window = new BrowserWindow({ title: "Bityn" });
    /** Temporarily removed the unused Electron menu bar */
    window.setMenu(null);
    window.loadURL('file://' + templates + '/window-main.html');
    window.webContents.on('did-finish-load', function() {
        const selectedFolders = dialog.showOpenDialog(window, {
            title: 'Music folder',
            defaultPath: app.getPath('music'),
            properties: ['openDirectory']
        });

        if(selectedFolders !== undefined)
            folders.add.apply(folders, selectedFolders);

        console.log(`Searching folders: ${Array.from(folders)}`);

        for(folder of folders) {
            console.log(`Now loading directory: ${folder}`);
            getAudioFiles(folder, acceptedExtensions)
                .map(file => loadTrackMetadata(file).catch(error => null))
                .filter(track => track !== null)
                .then(tracks => window.webContents.send('directory-loaded', tracks))
        }
    });
});

/**
 * Gets the paths of all the accepted audio files in a directory recursively.
 * @param {string} directory            - The directory path
 * @param {RegEx} acceptedExtensions    - A regex to test the files
 * @return {Promise<string[]>}          - A promise to the files
 */
function getAudioFiles(directory, acceptedExtensions) {
    const audioFiles = [];
    return fs.readdirAsync(directory)
                .catch(error => { console.log(error.message); return []; })
                .then(files => files.map(file => path.join(directory, file)))
                .map(file => {
                    return fs.statAsync(file)
                            .catch(console.log)
                            .then(stats => {
                                if(stats.isDirectory())
                                    return getAudioFiles(file, acceptedExtensions)
                                            .then(files => audioFiles.push.apply(audioFiles, files));
                                else if(!acceptedExtensions || acceptedExtensions.test(file))
                                    audioFiles.push(file);
                            });
                })
                .then(() => audioFiles);
}

/**
 * Loads an audio file metadata.
 * @param {string} filePath - The full path to the audio file.
 * @return {Promise<Track>} - A promise to the track
 */
function loadTrackMetadata(filePath) {
    const fileReadStream = fs.createReadStream(filePath);
    return readTrackMetadata(fileReadStream)
            .then(metadata => {
                metadata.path = filePath;
                return Track.fromMetadata(metadata);
            })
            .catch(error => {
                console.log(`Could not load metadata: ${filePath}`);
                throw error;
            });
}
