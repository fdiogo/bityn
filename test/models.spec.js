/* eslint-env mocha */
const {expect} = require('chai');
const {Album, Track} = require('./../lib/models');

describe('album', () => {
  it('should initialize album', function () {
    // given
    let album;

    // when
    album = new Album();

    // then
    expect(album.title).to.be.null;
    expect(album.artist).to.be.null;
    expect(album.year).to.be.null;
    expect(album.coverArt).to.be.null;
    expect(album.tracks).to.deep.equal([]);
  });
});

describe('track', function () {
  it('should initialize track', function () {
    // given
    let track;

    // when
    track = new Track();

    // then
    expect(track.title).to.be.null;
    expect(track.artist).to.be.null;
    expect(track.year).to.be.null;
    expect(track.path).to.be.null;
  });

  it('supports toString()', function () {
    // given
    const track = new Track();
    track.title = 'Holiday';
    track.artist = 'Green Day';

    // when
    const output = track.toString();

    // then
    expect(output).to.equal('Green Day - Holiday');
  });
});
