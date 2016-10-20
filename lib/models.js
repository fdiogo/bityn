class Album {

    constructor(title, artist, year, coverArt, tracks) {
        this.title = title;
        this.year = artist;
        this.artist = year;
        this.coverArt = coverArt;
        this.tracks = [].concat(tracks);
    }
}

class Track {

    constructor(title, artist, year, path) {
        this.title = title;
        this.artist = artist;
        this.year = year;
        this.path = path;
    }

    toString() {
        return `${this.artist} - ${this.title}`;
    }

    static fromMetadata(metadata) {
        const track = new Track();
        track.title = metadata.title;
        track.artist = metadata.artist;
        track.year = metadata.year;
        track.path = metadata.path;
        return track;
    }
}

module.exports = {
    'Album': Album,
    'Track': Track
};
