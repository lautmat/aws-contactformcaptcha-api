require('es6-promise').polyfill();
require('isomorphic-fetch');

let RECEIVEREMAIL = process.env.RECEIVEREMAIL;
let SENDEREMAIL = process.env.SENDEREMAIL;
let RECAPTCHASECRETKEY = process.env.RECAPTCHASECRETKEY;

const fetch = require("node-fetch");

var AWS = require('aws-sdk');
var ses = new AWS.SES();
 
exports.handler = function (event, context) {
    checkCaptcha(event, function (err, data) {
        context.done(err, null);
    });
};
 
async function checkCaptcha (event, done) {
// Validate Captcha
const recaptchaResult = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    body: `secret=${RECAPTCHASECRETKEY}&response=${event.rescaptcha}`
  })
  .then(res => (res.json()))
  .then(json => (json.success))
  .catch(err => { throw new Error(`Error in Google Siteverify API. ${err.message}`) });
  console.log('Recaptcha result:', recaptchaResult); 	
  if (event.rescaptcha === null || !recaptchaResult) {
  throw new Error(`Not a valid captcha response. Probably a bot.`)
}  
    
    var params = {
        Destination: {
            ToAddresses: [
                RECEIVEREMAIL
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: 'Name: ' + event.name + '\n\nEmail: ' + event.email + '\n\nSubject: ' + event.subject + '\n\n' + event.desc,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Resume Website Form: ' + event.name,
                Charset: 'UTF-8'
            }
        },
        Source: SENDEREMAIL
    };
    ses.sendEmail(params, done);
    console.log('Message sent to', RECEIVEREMAIL);
}