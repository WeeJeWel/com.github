'use strict';

const Homey = require('homey');
const { OAuth2Device } = require('homey-oauth2app');

module.exports = class GitHubDevice extends OAuth2Device {

  async onOAuth2Init() {
    const { id, login } = this.getData();
    this.id = id;
    this.login = login;
    this.log(`${login} (${id})`);

    const homeyId = await this.homey.cloud.getHomeyId();
    const webhooks = await this.oAuth2Client.getOrganizationWebhooks({
      organization: this.login,
    });

    // Create Webhook if not yet available
    if (webhooks.length < 1) {
      const webhookUrl = `https://webhooks.athom.com/webhook/${Homey.env.WEBHOOK_ID}?homey=${homeyId}`;
      this.log(`Webhook URL: ${webhookUrl}`);

      await this.oAuth2Client.createOrganizationWebhook({
        organization: this.login,
        url: webhookUrl,
      });
    }
  }

  onWebhook(payload) {
    this.log('onWebhook', payload);

    if (payload.issue) {
      if (payload.action === 'opened'
       || payload.action === 'reopened'
       || payload.action === 'closed') {
        this.homey.flow
          .getDeviceTriggerCard(`issue_${payload.action}`)
          .trigger(this, {
            username: payload.sender.login,
            repository: payload.repository.name,
            number: String(payload.issue.number),
            title: payload.issue.title,
          })
          .catch(this.error);
      }
    } else if (payload.pusher) {
      this.homey.flow
        .getDeviceTriggerCard('push')
        .trigger(this, {
          username: payload.sender.login,
          repository: payload.repository.name,
        })
        .catch(this.error);
    } else if (payload.pull_request) {
      if (payload.action === 'opened'
       || payload.action === 'reopened') {
        this.homey.flow
          .getDeviceTriggerCard(`pull_request_${payload.action}`)
          .trigger(this, {
            username: payload.sender.login,
            repository: payload.repository.name,
            number: String(payload.pull_request.number),
            title: payload.pull_request.title,
          })
          .catch(this.error);
      } else if (payload.action === 'closed') {
        this.homey.flow
          .getDeviceTriggerCard(`pull_request_${payload.pull_request.merged ? 'merged' : 'closed'}`)
          .trigger(this, {
            username: payload.sender.login,
            repository: payload.repository.name,
            number: String(payload.pull_request.number),
            title: payload.pull_request.title,
          })
          .catch(this.error);
      }
    }
  }

};
