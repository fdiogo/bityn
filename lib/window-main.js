const {ipcRenderer} = require('electron');
const $ = require('jquery');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const libPath = path.join(__dirname, '..', 'lib');
const templatesPath = path.join(__dirname, '..', 'templates');
const templatePath = path.join(templatesPath, 'window-main-track.html');

const template = fs.readFileSync(templatePath, 'utf-8');
const sidebar = $('#sidebar-content');
const query = $('#search-query');
const trackTitle = $('#track-title');
const audio = $('audio')[0];
const playPause = $('#play-pause');
const volume = $('#volume');
playPause.icon = playPause.children()[0];
volume.icon = volume.children()[0];

const loadedTracks = [];
mustache.parse(template);

ipcRenderer.on('track-loaded', (event, track) => addTracks([track]));
ipcRenderer.on('directory-loaded', (event, tracks) => addTracks(tracks));
query.on('input', () => filterTracks(query.val()));
playPause.on('click', () => audio.paused ? resume() : pause());
volume.on('click', () => audio.volume === 0 ? setVolume(100) : setVolume(0));

/**
 * Filters the shown tracks on the sidebar based on a query
 * @param {string} query - The filtering query
 */
function filterTracks(query) {
    const regex = new RegExp(query, ['i']);
    for(track of loadedTracks) {
        if(regex.test(track.model.title) || regex.test(track.model.artist))
            $(track.element).show();
        else
            $(track.element).hide();
    }
}

/**
 * Adds a collection of tracks to the sidebar
 * @param {Track[]} tracks - The collection of tracks to be added
 */
function addTracks(tracks) {
    for(track of tracks) {
        let trackElement = renderTrack(track);
        loadedTracks.push({model: track, element: trackElement});
        $(sidebar).append(trackElement);
    }
}

/**
 * Renders the corresponding mustache template for a track
 * @param {Track} track - The track to be rendered
 * @return {Element}    - The rendered track template
 */
function renderTrack(track) {
    const renderedContent = mustache.render(template, track);
    const trackElement = $(renderedContent);
    $(trackElement).on('click', () => playTrack(track));
    return trackElement;
}

/**
 * Sets the volume
 * @param {number} percentage - The volume percentage
 */
function setVolume(percentage) {
    if(typeof percentage !== 'number')
        return;

    percentage = Math.min(100, Math.max(0, percentage));
    audio.volume = percentage/100;
    if(percentage === 0)
        $(volume.icon).removeClass('volume-up volume-down').addClass('mute');
    else if(percentage <= 50)
        $(volume.icon).removeClass('volume-up mute').addClass('volume-down');
    else
        $(volume.icon).removeClass('mute volume-down').addClass('volume-up');
}

/**
 * Pauses the player
 */
function pause() {
    audio.pause();
    $(playPause.icon).removeClass('pause').addClass('play');
}

/**
 * Resumes the player
 */
function resume() {
    if(audio.src) {
        audio.play();
        $(playPause.icon).removeClass('play').addClass('pause');
    }
}

/**
 * Plays a track
 * @param {Track} track - Track to be played
 */
function playTrack(track) {
    audio.src = track.path;
    $(trackTitle).text(`${track.artist} - ${track.title}`);
    resume();
}
