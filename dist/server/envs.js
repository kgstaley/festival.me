"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stateKey = 'spotify_auth_state';
const redirectUri = process.env.REDIRECT_URI;
const clientId = process.env.SPOTIFY_ID;
const clientSecret = process.env.SPOTIFY_SECRET;
const envs = {
    stateKey,
    redirectUri,
    clientId,
    clientSecret,
};
exports.default = envs;
//# sourceMappingURL=envs.js.map