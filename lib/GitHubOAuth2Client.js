'use strict';

const { OAuth2Client, fetch } = require('homey-oauth2app');

module.exports = class GitHubOAuth2Client extends OAuth2Client {

  async onGetTokenByCode({ code }) {
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', this._clientId);
    body.append('client_secret', this._clientSecret);
    body.append('code', code);
    body.append('redirect_uri', this._redirectUrl);

    const response = await fetch(this._tokenUrl, {
      body,
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Invalid Response (${response.status})`);
    }

    this._token = await this.onHandleGetTokenByCodeResponse({ response });
    return this.getToken();
  }

  async getUser() {
    return this.get({
      path: '/user',
    });
  }

  async getUserOrganizations() {
    return this.get({
      path: '/user/orgs',
    });
  }

  async getOrganizationWebhooks({ organization }) {
    return this.get({
      path: `/orgs/${organization}/hooks`,
    });
  }

  async createOrganizationWebhook({
    organization,
    url,
    events = [
      // 'workflow_dispatch', // Requires GitHub App
      // 'workflow_run', // Requires GitHub App
      'push',
      'pull_request',
      // 'pull_request_review',
      // 'pull_request_review_comment',
      'issues',
      // 'release',
      // 'star',
    ],
  }) {
    return this.post({
      path: `/orgs/${organization}/hooks`,
      json: {
        events,
        name: 'web',
        config: {
          url,
          content_type: 'json',
        },
      },
    });
  }

};
