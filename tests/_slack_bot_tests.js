// 'use strict';

// const app = require('express')();
// const expect = require('chai').expect;
// const request = require('request-promise');
// const JsonFileStore = require('jfs');
// require('chai').should();
// const _ = require('lodash');
// const SlackBot = require('../../lib').botTypes.SlackBot;
// const config = require('../config.js');

// const credentials = config.slackCredentials;
// const slackTeamInfo = config.slackTeamInfo;
// const slackTestInfo = config.slackTestInfo;


// describe('Slack bot tests', function() {
//   const slackSettings = {
//     credentials,
//     webhookEndpoint: '/slack/webhook',
//     storeTeamInfoInFile: true
//   };

//   const baseIncommingMessage = {
//     token: credentials.verificationToken,
//     team_id: slackTestInfo.team_id,
//     api_app_id: slackTestInfo.api_app_id,
//     event: {
//       type: 'message',
//       user: slackTestInfo.user,
//       text: 'Part & Bullshit :tada',
//       ts: '1474463115.000004',
//       channel: slackTestInfo.channel,
//       event_ts: '1474463115.000004'
//     },
//     type: 'event_callback',
//     authed_users: [
//       slackTestInfo.bot_user_id
//     ]
//   };

//   /*
//   * Before all tests, create an instance of the bot which is
//   * accessible in the following tests.
//   * And also set up the mountpoint to make the calls.
//   * Also start a server listening on port 3002 locally
//   * then close connection
//   */
//   let bot= null;
//   let server = null;

//   describe('slack #__formatUpdate(rawUpdate)', function() {
//     it('should format a text message update in the expected way', function() {
//       const rawUpdate = baseIncommingMessage;
//       const senderId = `${slackTestInfo.team_id}.${slackTestInfo.channel}.${slackTestInfo.user}`;

//       const expectedUpdate = {
//         raw: rawUpdate,
//         sender: {
//           id: senderId
//         },
//         recipient: {
//           id: `${slackTestInfo.team_id}.${slackTestInfo.channel}`
//         },
//         timestamp: parseInt(rawUpdate.event.ts.split('.')[0]) * 1000,
//         message: {
//           mid: `${senderId}.${rawUpdate.event.ts}`,
//           seq: rawUpdate.event.ts.split('.')[1],
//           text: rawUpdate.event.text
//         }
//       };

//       const update = bot.__formatUpdate(rawUpdate);
//       expect(update).to.deep.equal(expectedUpdate);
//     });
//   });

//   after(function(done) {
//     server.close(() => done());
//   });
// });
