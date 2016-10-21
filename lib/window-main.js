const {ipcRenderer} = require('electron');
const $ = require('jquery');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const libPath = path.join(__dirname, '..', 'lib');
const templatesPath = path.join(__dirname, '..', 'templates');
const templatePath = path.join(templatesPath, 'window-main-track.html');
const Player = require(path.join(libPath, 'player.js'));

const template = fs.readFileSync(templatePath, 'utf-8');
const sidebar = $('#sidebar-content');
const query = $('#search-query');
const trackTitle = $('#track-title');
const loadedTracks = [];
const player = new Player();
mustache.parse(template);

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
    $(trackElement).on('click', () => {
        player.playTrack(track);
        $(trackTitle).text(`${track.artist} - ${track.title}`);
    });
    return trackElement;
}
