import test from 'ava';
import { incomingUpdateFixtures } from 'botmaster-test-fixtures';
import Botmaster from 'botmaster';
import request from 'request-promise';
import config from './_config';

import SlackBot from '../lib';

test.beforeEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster = new Botmaster();
    const bot = new SlackBot({
      credentials: config.slackCredentials(),
      webhookEndpoint: 'webhook',
      storeTeamInfoInFile: true,
    });
    t.context.botmaster.addBot(bot);
    t.context.requestOptions = {
      method: 'POST',
      uri: 'http://localhost:3000/slack/webhook',
      body: config.slackRawIncomingTextMessage(),
      json: true,
      resolveWithFullResponse: true,
    };
    t.context.botmaster.on('listening', resolve);
  });
});

test.afterEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster.server.close(resolve);
  });
});

test('#__verifyRequestOrigin should respond with 403 if token is invalid', async (t) => {
  t.plan(1);

  try {
    t.context.requestOptions.body.token = 'wrong token';
    await request(t.context.requestOptions);
  } catch (errorResponse) {
    t.is(errorResponse.statusCode, 403, 'wrong error response');
  }
});

test('update should go through middleware if request is valid', (t) => {
  t.plan(1);

  return new Promise(async (resolve, reject) => {
    t.context.botmaster.use({
      type: 'incoming',
      controller: (bot, update) => {
        t.pass();
        resolve();
      },
    });
    const response = await request(t.context.requestOptions);
    t.is(response.statusCode, 200, 'Should have gotten a 200 response');
  });
});

test('#__respondToVerificationHandshake should respond with' +
'challenge when sending over verification handshake', async (t) => {
  t.plan(1);

  const challenge = 'some challenge';
  t.context.requestOptions.body.type = 'url_verification';
  t.context.requestOptions.body.challenge = challenge;
  const res = await request(t.context.requestOptions);
  t.is(res.body.challenge, challenge, 'did not get back the sent challenge...');
});

test('#__authorizeApplicationForTeam should respond with 400 if no code is present', async (t) => {
  t.plan(1);

  try {
    t.context.requestOptions.method = 'GET';
    await request(t.context.requestOptions);
  } catch (errorResponse) {
    t.is(errorResponse.statusCode, 400, 'wrong error response');
  }
});
