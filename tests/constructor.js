import test from 'ava';

import SlackBot from '../lib';
import config from './_config';

test('throw error when none of storeTeamInfoInFile or storeTeamInfoHooks are defined', (t) => {
  t.plan(1);

  try {
    const bot = new SlackBot({
      credentials: config.slackCredentials(),
      webhookEndpoint: 'webhook',
    });
  } catch (err) {
    t.is(err.message, 'bots of type \'slack\' must be defined with exactly ' +
    'one of storeTeamInfoInFile set to true or storeTeamInfoHooks defined');
  }
});

test('throw error when both storeTeamInfoInFile or storeTeamInfoHooks are defined', (t) => {
  t.plan(1);

  try {
    const bot = new SlackBot({
      credentials: config.slackCredentials(),
      webhookEndpoint: 'webhook',
      storeTeamInfoInFile: true,
      storeTeamInfoHooks: {},
    });
  } catch (err) {
    t.is(err.message, 'bots of type \'slack\' must be defined with exactly ' +
    'one of storeTeamInfoInFile set to true or storeTeamInfoHooks defined');
  }
});

const storeTeamInfoHooksErrorMacro = (t, params) => {
  t.plan(1);

  try {
    const bot = new SlackBot({
      credentials: config.slackCredentials(),
      webhookEndpoint: 'webhook',
      storeTeamInfoHooks: params.storeTeamInfoHooks,
    });
  } catch (err) {
    t.is(err.message, 'storeTeamInfoHooks must be an object with two' +
    ' keys: storeTeamInfo and getTeamInfo with function values');
  }
};

storeTeamInfoHooksErrorMacro.title = customTitlePart =>
  `throws error when storeTeamInfoInFile is falsy and storeTeamInfoHooks${customTitlePart}`;

test(' is not an object', storeTeamInfoHooksErrorMacro, {
  storeTeamInfoHooks: __ => __,
});

test('\'s storeTeamInfo is not a function', storeTeamInfoHooksErrorMacro, {
  storeTeamInfoHooks: {
    storeTeamInfo: 'not a function',
  },
});

test('\'s getTeamInfo is not a function', storeTeamInfoHooksErrorMacro, {
  storeTeamInfoHooks: {
    storeTeamInfo: __ => __,
    getTeamInfo: 'not a function',
  },
});

test('verify that settings are correctly set after default instantiation', (t) => {
  t.plan(8);

  const bot = new SlackBot({
    credentials: config.slackCredentials(),
    webhookEndpoint: 'webhook',
    storeTeamInfoInFile: true,
  });

  t.is(bot.type, 'slack', 'bot type was wrong');
  t.is(bot.requiresWebhook, true);
  t.is(bot.webhookEndpoint, 'webhook');
  t.deepEqual(bot.requiredCredentials,
    ['clientId', 'clientSecret', 'verificationToken'], 'Wrong reuiredCredentials');
  t.deepEqual(bot.receives, {
    text: true,
    attachment: false,
    postback: false,
    quickReply: false,
    echo: false,
    read: false,
    delivery: false,
  }, 'bot.receives is not as expected');
  t.deepEqual(bot.sends, {
    text: true,
    quickReply: false,
    locationQuickReply: false,
    senderAction: false,
    attachment: false,
  }, 'bot.sends is not as expected');
  t.is(bot.retrievesUserInfo, false, 'bot.retrievesUserInfo is not as expected');
  t.is(bot.landingPageUrl, 'https://my.slack.com', 'landingPageUrl not as expected');
});

test('instantiating with landingPageUrl sets it correctly', (t) => {
  t.plan(1);

  const bot = new SlackBot({
    credentials: config.slackCredentials(),
    webhookEndpoint: 'webhook',
    storeTeamInfoInFile: true,
    landingPageUrl: 'someOtherPage',
  });
  t.is(bot.landingPageUrl, 'someOtherPage', 'landingPageUrl not as expected');
});

test('instantiating with valid storeTeamInfoHooks works', (t) => {
  t.plan(1);

  const bot = new SlackBot({
    credentials: config.slackCredentials(),
    webhookEndpoint: 'webhook',
    storeTeamInfoHooks: {
      storeTeamInfo: async () => 'myTeamInfo',
      getTeamInfo: async () => 'myTeamInfo',
    },
  });
  t.is(bot.landingPageUrl, 'someOtherPage', 'landingPageUrl not as expected');
});
