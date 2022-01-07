'use strict';

const Homey = require('homey');
const { OAuth2Driver } = require('homey-oauth2app');

module.exports = class GitHubDriver extends OAuth2Driver {

  async onOAuth2Init() {
    // Register Webhook
    this.webhook = await this.homey.cloud.createWebhook(Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, {});
    this.webhook.on('message', ({ body }) => {
      const { organization } = body;
      if (!organization) return;

      const devices = this.getDevices();
      const device = devices.find(device => {
        const { id } = device.getData();
        return id === organization.id;
      });

      if (!device) return;

      try {
        device.onWebhook(body);
      } catch (err) {
        this.error(err);
      }
    });
  }

  async onPairListDevices({ oAuth2Client }) {
    const organizations = await oAuth2Client.getUserOrganizations();
    return organizations.map(organization => ({
      name: organization.login,
      data: {
        id: organization.id,
        login: organization.login,
      },
    }));
  }

};
