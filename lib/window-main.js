Promise = require('bluebird'); // eslint-disable-line
const {ipcRenderer} = require('electron');
const $ = require('jquery');
const fs = require('fs');
const path = require('path');
const dust = Promise.promisifyAll(require('dustjs-linkedin'));

const templatesPath = path.join(__dirname, '..', 'templates');
const templatePath = path.join(templatesPath, 'window-main-track.html');

const audio = $('audio')[0];
const sidebar = $('#sidebar-content');
const query = $('#search-query');
const trackTitle = $('#track-title');
const playPause = $('#play-pause');
const volume = $('#volume');
const progressBar = $('#progress-bar');
const progressBarOverlay = $('#progress-bar-overlay');
const template = fs.readFileSync(templatePath, 'utf-8');
playPause.icon = playPause.children().first();
volume.icon = volume.children().first();

// did-finish-load race condition, this needs to be changed
dust.loadSource(dust.compile(template, 'track'));

const loadedTracks = [];
const updateRate = 200;
let updateRoutine = null;

ipcRenderer.on('track-loaded', (event, track) => addTracks([track]));
ipcRenderer.on('directory-loaded', (event, tracks) => addTracks(tracks));
progressBar.mouseenter(() => stopUpdateRoutine());
progressBar.mouseleave(() => updateProgressBar() || !audio.paused && startUpdateRoutine());
progressBar.mousemove(event => progressBarOverlay.width(`${getProgressBarPercentage(event)}%`));
progressBar.click(event => seekTrack(getProgressBarPercentage(event)));
playPause.on('click', () => audio.paused ? resume() : pause());
volume.on('click', () => audio.volume === 0 ? setVolume(100) : setVolume(0));
query.on('input', () => filterTracks(query.val()));

/**
* Gets the width percentage of the progress bar on the mouse position.
* @param {Event} event - Mouse event
* @return {number}     - The width percentage
*/
function getProgressBarPercentage (event) {
  let width = event.pageX - progressBar.offset().left;
  return width * 100 / progressBar.width();
}

/**
* Updates the progress bar according to the current time of the track.
*/
function updateProgressBar () {
  const percentage = audio.currentTime * 100 / audio.duration;
  progressBarOverlay.width(`${percentage}%`);
}

/**
* Starts a routine to update the progress bar
*/
function startUpdateRoutine () {
  updateProgressBar();

  if (!updateRoutine) {
    updateRoutine = setInterval(updateProgressBar, updateRate);
  }
}

/**
* Stops the progress bar updating routine
*/
function stopUpdateRoutine () {
  if (!updateRoutine) {
    return;
  }

  clearInterval(updateRoutine);
  updateRoutine = null;
}

/**
* Sets the volume
* @param {number} percentage - The volume percentage
*/
function setVolume (percentage) {
  if (typeof percentage !== 'number') {
    return;
  }

  percentage = Math.min(100, Math.max(0, percentage));
  audio.volume = percentage / 100;
  if (percentage === 0) {
    $(volume.icon).removeClass('volume-up volume-down').addClass('mute');
  } else if (percentage <= 50) {
    $(volume.icon).removeClass('volume-up mute').addClass('volume-down');
  } else {
    $(volume.icon).removeClass('mute volume-down').addClass('volume-up');
  }
}

/**
* Pauses the player
*/
function pause () {
  audio.pause();
  $(playPause.icon).removeClass('pause').addClass('play');
  stopUpdateRoutine();
}

/**
* Resumes the player
*/
function resume () {
  if (audio.src) {
    audio.play();
    $(playPause.icon).removeClass('play').addClass('pause');
    startUpdateRoutine();
  }
}

/**
* Plays a track
* @param {Track} track - Track to be played
*/
function playTrack (track) {
  audio.src = track.path;
  $(trackTitle).text(`${track.artist} - ${track.title}`);
  resume();
}

/**
* Seeks a specific point of the track
* @param {number} percentage - The track duration percentage
*/
function seekTrack (percentage) {
  audio.currentTime = percentage / 100 * audio.duration;
}

/**
* Filters the shown tracks on the sidebar based on a query
* @param {string} query - The filtering query
*/
function filterTracks (query) {
  const regex = new RegExp(query, ['i']);
  for (let track of loadedTracks) {
    if (regex.test(track.model.title) || regex.test(track.model.artist)) {
      $(track.element).show();
    } else {
      $(track.element).hide();
    }
  }
}

/**
* Adds a collection of tracks to the sidebar
* @param {Track[]} tracks  - The collection of tracks to be added
* @return {Promise}        - A promise resolved when all tracks are added
*/
function addTracks (tracks) {
  return Promise.map(tracks, track => {
    renderTrack(track)
    .then(element => ({ model: track, element: element }))
    .then(track => {
      loadedTracks.push(track);
      $(sidebar).append(track.element);
    });
  });
}

/**
* Renders the corresponding mustache template for a track
* @param {Track} track         - The track to be rendered
* @return {Promise<Element>}   - A promise to the rendered track template
*/
function renderTrack (track) {
  return dust.renderAsync('track', track)
    .then(rendered => {
      const trackElement = $(rendered);
      $(trackElement).on('click', () => playTrack(track));
      return trackElement;
    });
}
