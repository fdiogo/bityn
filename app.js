'use strict';

const {app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const readTrackMetadata = Promise.promisify(require('musicmetadata'));

const lib = path.join(__dirname, 'lib');
const templates = path.join(__dirname, 'templates');
const models = path.join(lib, 'models.js');

const {Track} = require(models);

app.on('ready', () => {
  const folders = new Set([app.getPath('music')]);
  const acceptedExtensions = /\.mp3$/;

  const window = new BrowserWindow({ title: 'Bityn' });
  window.loadURL('file://' + templates + '/window-main.html');
  window.webContents.on('did-finish-load', function () {
    const selectedFolders = dialog.showOpenDialog(window, {
      title: 'Music folder',
      defaultPath: app.getPath('music'),
      properties: ['openDirectory']
    });

    if (selectedFolders !== undefined) {
      folders.add.apply(folders, selectedFolders);
    }

    console.log(`Searching folders: ${Array.from(folders)}`);

    const loadAndSend = file => loadTrackMetadata(file)
                                        .then(track => window.webContents.send('track-loaded', track))
                                        .catch(error => console.log(error.message));

    for (const folder of folders) {
      console.log(`Now loading directory: ${folder}`);
      getAudioFiles(folder, acceptedExtensions, loadAndSend);
    }
  });
});

/**
 * Gets the paths of all the accepted audio files in a directory recursively.
 * @param {string} directory            - The directory path
 * @param {RegEx} acceptedExtensions    - A regex to test the files
 * @param {Function} each               - A callback for each valid file
 */
function getAudioFiles (directory, acceptedExtensions, each) {
  fs.readdirAsync(directory)
        .then(files => files.map(file => path.join(directory, file)))
        .each(file => {
          fs.statAsync(file)
                .then(stats => {
                  if (stats.isDirectory()) {
                    getAudioFiles(file, acceptedExtensions, each);
                  } else if (!acceptedExtensions || acceptedExtensions.test(file)) {
                    each(file);
                  }
                })
                .catch(error => console.log(`${file}: ${error.message}`));
        })
        .catch(error => console.log(error.message));
}

/**
 * Loads an audio file metadata.
 * @param {string} filePath - The full path to the audio file.
 * @return {Promise<Track>} - A promise to the track
 */
function loadTrackMetadata (filePath) {
  const fileReadStream = fs.createReadStream(filePath);
  return readTrackMetadata(fileReadStream)
            .then(metadata => {
              metadata.path = filePath;
              return Track.fromMetadata(metadata);
            })
            .catch(() => {
              throw new Error(`Could not load metadata: ${filePath}`);
            });
}
