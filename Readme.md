# Botmaster-slack

[![Build Status](https://travis-ci.org/botmasterai/botmaster-slack.svg?branch=master)](https://travis-ci.org/botmasterai/botmaster-slack)
[![Coverage Status](https://coveralls.io/repos/github/botmasterai/botmaster-slack/badge.svg?branch=master)](https://coveralls.io/github/botmasterai/botmaster-slack?branch=master)
[![npm-version](https://img.shields.io/npm/v/botmaster-slack.svg)](https://www.npmjs.com/package/botmaster-slack)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE)

This is the Slack integration for botmaster. It allows you to use your 
botmaster bot on Slack

Botmaster is a lightweight chatbot framework. Its purpose is to integrate your existing chatbot 
into a variety of messaging channels - Facebook Messenger, Slack, Twitter DM,  Telegram etc...

## Documentation

Find the whole documentation for the framework on: http://botmasterai.com/

## Installing

```bash
yarn add botmaster-messenger
```

or

```bash
npm install --save botmaster-messenger
```

## The Botmaster Slack bot

Because Slack works slightly differently from the other platforms provided as packages, I will briefly explain here what your botmaster Slack bot will be exactly.

As you surely know, Slack is a product that enables team members to communicate easily with one another. because of that, one team member can't just "add" a bot for herself in the same way one would in Facebook Messenger or Telegram or other.

Teams can either build a bot that will only live within their own slack team. Or they can package a bot in a Slack app that "packages" the bot.
Admin team members can add support for a bot (by installing an App that packages said bot) and then team members can start communicating with it as they would with another team member. At this point, they would be communicating with what is known as, in Slack semantics, a **bot user**.

All the information required by Slack concerning this is setup in the `slackSettings` object within Botmaster. This will allow us to create a Slack Bot object that communicates to end users via this **bot user** that needs to be set up on Slack's end. Because this whole setup and gathering the proper credentials is not as trivial as one might want and quite unclear on their website, here's a mini-tutorial to get you started with Botmaster * Slack.

## Botmaster Slack bot mini-tutorial

Following these steps, you will have a fully functional Slack bot using Botmaster that can then be edited as wanted. This mini-tutorial uses localtunnel to expose one of your ports to the world. see why you might want to use this and how to install and setup localtunnel [here](/getting-started/webhooks#localtunnel) for your local botmaster project. You can use ngrok or any other service you know or find suitable and achieve the same result.

#### Create an app

Navigate to: https://api.slack.com/apps and make sure you are signed in. If you aren't you will be redirected to your team's slack once logged in and will need to go back to the mentioned link.

Click the **create new App** button and enter any App Name you want. This won't be the name of the **bot user**. However, the name should ideally be related to your bot user so as not to confuse your users. For instance, if your bot user will be called *my_super_bot*, calling the app something like *My Super Bot App* would make sense.

#### Get your first credentials

On this page you were redirected to, you will find an *App credentials* section. Both your Client ID (`clientId` in Botmaster) and your Client Secret (`clientSecret` in Botmaster) are here. Take note of them.

#### Setup Your App's OAuth Webhook

You don't need to know anything about OAuth to complete this step. Just know that this URL will be called when people are installing/authorizing your app.

In the left panel, click on the **OAuth & Permissions** tab and enter your webhook in the **Redirect URL(s)** field as shown here:
    ![Slack Setup 1](images/slack_setup_1.png)
This URL has to be of the form: **https://\<your_base_url\>/slack/\<webhookEndpoint\>**. For example, **if** I am using localtunnel to test the bot locally, and started localtunnel by running the following:
 ```bash
  lt -p 3000 -s botmastersubdomain
 ```
I would set my Redirect URL(s) to: `https://botmastersubdomain.localtunnel.me/slack/webhookd24sr34se` (based on the `webhookEnpoint` set in my `slackSettings` in the "Start your Botmaster App Locally" section). Click on **Save Changes**.

#### Add a Bot User

Go to **Bot Users** and click on the **Add a Bot User** button. Select a name for your bot (e.g. my_super_bot) and click the **Add Bot User** button.

#### Get the rest of your credentials

Navigate to the **Event Subscriptions** tab and click on the toggle button in the to right corner to **on**. Then in the **Request URL** field that pops up, enter the same URL as in the OAuth & Permissions tab. **You will get an error**. This is normal and is due to two reasons. Firstly, we don't actually have an app started and listening at the mentioned URL and secondly because even if we did, we don't have our App's verification Token. Let's fix this!

Navigate back to **Basic Information** and note that you now have a **Verification Token** in the App Credentials box. Take note of it.

#### Start your Botmaster App Locally

Start your botmaster app in any project folder you might want (see [here](/getting-started/installation) if you haven't installed botmaster yet). To start the botmaster project, you'll want to create an `app.js` file with the following contents:

```js
const Botmaster = require('botmaster');
const SlackBot = require('botmaster-slack');
const botmaster = new Botmaster();

const slackSettings = {
  credentials: {
    clientId: 'YOUR app client ID',
    clientSecret: 'YOUR app client secret',
    verificationToken: 'YOUR app verification Token'
  },
  webhookEndpoint: 'webhookd24sr34se',
  storeTeamInfoInFile: true,
};

const slackBot = new SlackBot(slackSettings);
botmaster.addBot(slackBot);

botmaster.use({
  type: 'incoming',
  name: 'slack-incoming-middleware',
  controller: (bot, update) => {
    return bot.reply(update, 'Hello world!');
  }
});
```
and place it at the root of your project folder. Replace the credentials with the ones you have gathered. Run `node app.js` to start the app. Let's now expose our bot to the world.

For the webhook to work locally, you'll now need to make sure you've started localtunnel. If you are doing all of that from a server that already has a Domain Name, you won't need to do this. But I am assuming most people are doing this from their local computer. so in the command line, run something like this:
```bash
lt -p 3000 -s <wanted_base_url_for_your_bot>
```

#### Setup Your App's Events and Events Webhook

Go back to the **Event subscription** page and enter your webhook url again. This should now work and look something like this: ![Slack Setup 2](images/slack_setup_2.png) Scroll down and click on **Add Bot User Events**. At the minimum, add the following events:
    * message.ipm
    * message.channels
    * message.im
    * message.groups
Click **Save Changes**

#### Install your Slack App

We're almost done here. We need a way to install our app to test it out. This is done via what is called a **Slack button**. because botmaster manages all the nitty-gritty parts of this process, all you need to do is create a `views` folder in your project folder and create an `index.html` file in this views folder with the following contents
```html
<a href="https://slack.com/oauth/authorize?scope=bot&client_id=YOUR_APP_CLIENT_ID">
  <img alt="Add to Slack" height="40" width="139"
  src="https://platform.slack-edge.com/img/add_to_slack.png"
  srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
          https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
</a>
```
Note that you'll need to replace **YOUR_APP_CLIENT_ID** in the href with your own. You definitely don't want to put in your client secret here!

#### Try out your bot!

Assuming your botmaster app and localtunnel are still running, open your `index.html` file (not in a text editor, but actually in a browser) by double clicking on it. Authorize your newly created app to add it to your team. You should now be redirected to your teams slack and be able to chat to your bot.

#### Make your Bot Available to the World

You might actually want to allow others to install your app by using the Slack Button. However, to do so you will need to host it somewhere. We'll use an express app and use the same server for both express and botmaster. We update our app.js file to look like this:

```js
const express = require('express'); // added
const Botmaster = require('botmaster');
const SlackBot = require('botmaster-slack');

const app = express(); // added
const myServer = app.listen(3000, '0.0.0.0'); // added
const botmaster = new Botmaster({
  server: myServer, // added
});
.
.
.
app.use(express.static(__dirname + '/views')); //added
// or if you don't want it at the root of your app, add this:
app.use('/slack', express.static(__dirname + '/views')); // added

botmaster.use({
  type: 'incoming',
  name: 'slack-incoming-middleware',
  controller: (bot, update) => {
    return bot.reply(update, 'Hello world!');
  }
});
```
Make sure to add either one of the `app.use...` lines.
If you pick the first one, navigate to your URL (`https://botmastersubdomain.localtunnel.me/` for this example) and you will see the button.
If your pick the second one, navigate to your sub URL (`https://botmastersubdomain.localtunnel.me/slack` for this example) to see the Slack button.

## Webhooks

Now as with any other platform using Webhooks, you'll need to update these to your production Domain Name once you deploy your code to production. And in a more general sense, if you are still unsure how webhooks work within the botmaster framework, go [here](/getting-started/webhooks.md)


## License

This library is licensed under the MIT [license](LICENSE)
