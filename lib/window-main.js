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

const sidebar = $('#sidebar');
const content = $('#content');
const player = new Player();

ipcRenderer.on('track-loaded', track => renderTrack(track));
ipcRenderer.on('directory-loaded', (event, tracks) => tracks.forEach(track => renderTrack(track)));

function renderTrack(track) {
    const renderedContent = mustache.render(template, track);
    const trackElement = $(renderedContent);
    $(trackElement).on('click', () => selectTrack(track));
    $(sidebar).append(trackElement);
}

function selectTrack(track) {
    player.play(track.path);
}
