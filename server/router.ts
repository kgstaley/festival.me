'use-strict';
import dotenv from 'dotenv';
import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { credentials, generateRandomString, logger } from './index';

dotenv.config();
const router = express.Router();
const spotifyWebApi = new SpotifyWebApi(credentials);
const scope = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'user-top-read',
    'playlist-modify-private',
];

// test ping
router.get('/hello', (req, res) => {
    res.send('hello world');
});

//#region spotify auth
router.get('/auth', (req, res) => {
    const state = generateRandomString(16);
    const url = spotifyWebApi.createAuthorizeURL(scope, state);
    res.redirect(url);
});

router.get('/auth/callback', (req, res) => {
    const { code } = req.query;
    if (!code) {
        logger('no code provided');
        res.sendStatus(400);
        return;
    }
    spotifyWebApi
        .authorizationCodeGrant(code.toString())
        .then((data) => {
            spotifyWebApi.setAccessToken(data.body.access_token);
            spotifyWebApi.setRefreshToken(data.body.refresh_token);
            res.redirect('http://localhost:8080/dashboard');
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

router.get('/auth/me', (req, res) => {
    spotifyWebApi
        .getMe()
        .then((data) => {
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

router.post('/auth/logout', (req, res) => {
    spotifyWebApi.resetAccessToken();
    res.sendStatus(res.statusCode);
});
//#endregion

//#region spotify api calls
// get several tracks based on track spotify id (querystring) with max of 50 at a time
router.get(`/spotify/tracks`, (req: any, res) => {
    if (!req.query) res.sendStatus(400);

    const { ids, market } = req.query;
    logger('market is (country code)', market);
    logger('spotify track ids are ', ids, typeof ids);

    spotifyWebApi
        .getTracks(ids, market)
        .then((data) => {
            res.json(data.body.tracks);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// search
router.get(`/spotify/search`, (req: any, res) => {
    if (!req.query) res.sendStatus(400);
    const { q, types, market, limit = 25, offset = 0 } = req.query;
    const options = { market, limit, offset };

    const parsedTypes = JSON.parse(types);

    spotifyWebApi
        .search(q, parsedTypes, options)
        .then((data) => {
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// create a private playlist
router.post(`/spotify/playlist/new`, (req: any, res) => {
    if (!req.query) res.sendStatus(400);

    const { name, description }: { name: string; description: string } = req.query;
    logger('name and description are', { name, description });

    const options = { description, public: false };

    spotifyWebApi
        .createPlaylist(name, options)
        .then((data) => {
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// add tracks to playlist
router.post(`/spotify/playlist/:playlistId/tracks/new`, (req, res) => {
    const { playlistId } = req.params;
    const { uris } = req.body;

    if (!uris || !!!uris.length) res.sendStatus(400);

    spotifyWebApi
        .addTracksToPlaylist(playlistId, uris)
        .then((data) => {
            logger('add tracks to playlist data.body', data.body);
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// get artist's top tracks
router.get(`/spotify/artist/:artistId/tops`, (req, res) => {
    const { artistId } = req.params;
    if (!artistId) res.sendStatus(res.statusCode);

    spotifyWebApi
        .getArtistTopTracks(artistId, 'US')
        .then((data) => {
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// get list of current user's playlists
router.get('/spotify/playlists', (req: any, res) => {
    // const { offset, limit } = req.query;
    const offset = req.query.offset;
    const limit = req.query.limit;

    spotifyWebApi
        .getUserPlaylists({ offset, limit })
        .then((data) => {
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// get a playlist
router.get('/spotify/playlist/:playlistId', (req: any, res) => {
    const { playlistId } = req.params;
    if (!playlistId) res.sendStatus(400);
    const { market } = req.query;
    const options = { market };

    spotifyWebApi
        .getPlaylist(playlistId, options)
        .then((data) => {
            res.json(data.body);
        })
        .catch((err) => {
            logger(err);
            res.sendStatus(res.statusCode);
        });
});

// get users top artists and tracks
router.get('/spotify/me/top/:type', (req: any, res) => {
    const { type } = req.params;
    const { time_range = 'medium_term', offset = 0, limit = 10 } = req.query;
    if (!type) res.sendStatus(res.statusCode);

    if (type === 'artists') {
        spotifyWebApi
            .getMyTopArtists({ time_range, offset, limit })
            .then((data) => {
                res.json(data.body);
            })
            .catch((err) => {
                logger(err);
                res.sendStatus(res.statusCode);
            });
    } else if (type === 'tracks') {
        spotifyWebApi
            .getMyTopTracks({ time_range, offset, limit })
            .then((data) => {
                res.json(data.body);
            })
            .catch((err) => {
                logger(err);
                res.sendStatus(res.statusCode);
            });
    }
});

//#endregion

// //#region songkick api 
// router.get("/")

// //#endregion

export default router;
