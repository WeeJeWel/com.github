'use strict';

const { OAuth2App } = require('homey-oauth2app');
const GitHubOAuth2Client = require('./GitHubOAuth2Client');

module.exports = class GitHubApp extends OAuth2App {

  async onOAuth2Init() {
    this.enableOAuth2Debug();
    this.setOAuth2Config({
      client: GitHubOAuth2Client,
      apiUrl: 'https://api.github.com',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      scopes: ['admin:org_hook', 'read:org', 'workflow'],
    });
  }

};
