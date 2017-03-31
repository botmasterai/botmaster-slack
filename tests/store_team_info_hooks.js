import test from 'ava';
import { incomingUpdateFixtures } from 'botmaster-test-fixtures';
import Botmaster from 'botmaster';
import nock from 'nock';
import request from 'request-promise';
import config from './_config';

import SlackBot from '../lib';

const webApiUrl = 'https://slack.com/api';

test.beforeEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster = new Botmaster();
    t.context.bot = new SlackBot({
      credentials: config.slackCredentials(),
      webhookEndpoint: 'webhook',
      storeTeamInfoInFile: true,
    });
    t.context.botmaster.addBot(t.context.bot);
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

test('default storeTeamInfo should return rejection if error occurs',
async (t) => {
  t.plan(1);

  try {
    const inner = {};
    const outer = {
      inner,
    };
    inner.outer = outer;
    const teamInfo = await t.context.bot.storeTeamInfoHooks.storeTeamInfo(
      t.context.bot, outer);
  } catch (err) {
    t.is(err.message, 'Converting circular structure to JSON', 'wrong error message');
  }
});

test('default getTeamInfo should return rejection if error occurs',
async (t) => {
  t.plan(1);

  try {
    const teamInfo = await t.context.bot.storeTeamInfoHooks.getTeamInfo(
      t.context.bot, 'someTeam');
  } catch (err) {
    t.is(err.message, 'could not load data for teamId: someTeam',
    'wrong error message');
  }
});

test('default hooks should perform as expected via ' +
'#__authorizeApplicationForTeam when making a GET request', async (t) => {
  t.plan(2);

  const code = 'someCode';

  // request made by botmaster to confirm code
  const slackTeamInfoReplier = nock(webApiUrl)
  .get('/oauth.access')
  .query({
    client_id: config.slackCredentials().clientId,
    client_secret: config.slackCredentials().clientSecret,
    code,
  })
  .reply(200, config.slackTeamInfo());

  // redirect responded by botmaster after it all worked
  nock('https://my.slack.com/').get('/').query(true).reply(200);

  t.context.requestOptions.method = 'GET';
  t.context.requestOptions.qs = { code };

  const response = await request(t.context.requestOptions);
  // the fact that nock didn't throw errors means it worked (as this happens)
  // after nock stuff
  const teamInfo = await t.context.bot.storeTeamInfoHooks.getTeamInfo(
    t.context.bot, config.slackTeamInfo().team_id);

  t.deepEqual(config.slackTeamInfo(), teamInfo, 'teamInfo was not same as expected');
  t.pass();
});

test('#__authorizeApplicationForTeam should reject when storeTeamInfo rejects',
async (t) => {
  t.plan(2);

  const code = 'someCode';
  t.context.bot.storeTeamInfoHooks.storeTeamInfo = () => {
    return Promise.reject(new Error('some error'));
  };

  const slackTeamInfoReplier = nock(webApiUrl)
  .get('/oauth.access')
  .query({
    client_id: config.slackCredentials().clientId,
    client_secret: config.slackCredentials().clientSecret,
    code,
  })
  .reply(200, config.slackTeamInfo());

  nock('https://slack.com').get('/400').query(true).reply(200);

  t.context.requestOptions.method = 'GET';
  t.context.requestOptions.qs = { code };

  t.context.botmaster.on('error', (bot, err) => {
    t.is(err.message, 'some error');
  });

  const response = await request(t.context.requestOptions);
  t.is(response.request.uri.href, 'https://slack.com/400', 'wrong redirect uri');
});
