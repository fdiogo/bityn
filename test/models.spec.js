'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);

var models = require('./../lib/models');

describe('album', function() {

    it('should initialize album', function() {
        // given
        var title = 'Hello';
        var artist = 'World';
        var year = 1975;
        var coverArt = 'http://www.image.jpeg';
        var tracks = ['t1', 't2'];

        // when
        var album = new models.Album(title, artist, year, coverArt, tracks);

        // then
        album.title.should.equal(title);
        album.artist.should.equal(artist);
        album.year.should.equal(year);
        album.coverArt.should.equal(coverArt);
        album.tracks.should.deep.equal(tracks);
    });

});

describe('track', function() {

    it('should initialize track', function() {
        // given
        var title = 'Hello';
        var artist = 'World';
        var year = 1975;
        var path = 'C:\\track';

        // when
        var track = new models.Track(title, artist, year, path);

        // then
        track.title.should.equal(title);
        track.artist.should.equal(artist);
        track.year.should.equal(year);
        track.path.should.equal(path);
    });

    it('supports toString()', function() {
        // given
        var track = new models.Track('Hello', 'World', 1975, 'C:\\track');
        var expected = 'World - Hello';

        // when
        var actual = track.toString();

        // then
        actual.should.equal(expected);
    })
});
