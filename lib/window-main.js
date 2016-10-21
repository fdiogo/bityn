const {ipcRenderer} = require('electron');
const $ = require('jquery');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const Player = require('audio-player');

const templatesPath = path.join(__dirname, '..', 'templates');
const templatePath = path.join(templatesPath, 'window-main-track.html');
const template = fs.readFileSync(templatePath, 'utf-8');
mustache.parse(template);

const sidebar = $('#sidebar-content');
const query = $('#search-query');
const content = $('#content');
const player = new Player();
const loadedTracks = [];

ipcRenderer.on('track-loaded', (event, track) => addTracks([track]));
ipcRenderer.on('directory-loaded', (event, tracks) => addTracks(tracks));
query.on('input', () => filterTracks(query.val()));

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
 * Starts playing a track
 * @param {Track} track - The track to be played
 */
function playTrack(track) {
    player.play(track.path);
}

/**
 * Pauses the audio player
 */
function pauseTrack() {
    player.pause();
}

/**
 * Starts playing or pauses a track if it's already playing.
 * @param {Track} track - The track to play/pause.
 */
function togglePlay(track) {
    player.playPause(track.path);
}
