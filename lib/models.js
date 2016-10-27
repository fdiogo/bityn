'use strict';

class Album {

  constructor () {
    this.title = null;
    this.artist = null;
    this.year = null;
    this.coverArt = null;
    this.tracks = [];
  }
}

class Track {

  constructor () {
    this.title = null;
    this.artist = null;
    this.year = null;
    this.path = null;
  }

  toString () {
    return `${this.artist} - ${this.title}`;
  }

  static fromMetadata (metadata) {
    const track = new Track();
    track.title = metadata.title;
    track.artist = metadata.artist;
    track.year = metadata.year;
    track.path = metadata.path;

    return Promise.resolve(track);
  }
}

module.exports.Album = Album;
module.exports.Track = Track;
