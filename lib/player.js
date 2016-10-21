module.exports = function Player() {
    // Because "audio-player" uses document right on require
    var AudioPlayer = require('audio-player');
    this.player = new AudioPlayer();

    /**
     * Returns the playing state
     */
    this.isPlaying = function () {
        return this.player.playing !== false;
    }

    /**
     * Starts playing a track
     * @param {Track} track - The track to be played
     */
    this.playTrack = function(track) {
        this.player.play(track.path);
    }

    /**
     * Pauses the audio player
     */
    this.pauseTrack = function() {
        this.player.pause();
    }

    /**
     * Starts playing or pauses a track if it's already playing.
     * @param {Track} track - The track to play/pause.
     */
    this.togglePlay = function(track) {
        this.player.playPause(track.path);
    }

    /**
     * Toggles play regardless of the track
     */
    this.togglePlay = function() {
        if(this.isPlaying())
            this.player.playPause(this.player.playing);
    }

}
