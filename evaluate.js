/**
 * Created by lancehughes on 7/31/16.
 */

var npm = require('npm');
var fs = require('fs');
var intentsData = require('./intentsData');
var Promised = require('bluebird');
var builder = require('botbuilder');

// Create bot and bind to console
//var connector = new builder.ConsoleConnector().listen();
//var bot = new builder.UniversalBot(connector);

var modelUrl = 'https://api.projectoxford.ai/luis/v1/application?id=4fe6b5ee-98da-4545-8929-5f19f95c841f&subscription-key=96e9d168f3e945a289c03a4d5052cbac';
//var recognizer = new builder.LuisRecognizer(modelUrl);
//var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
//bot.dialog('/', dialog);


module.exports = function(str) {


    return new Promise (function (resolve,reject) {

        builder.LuisRecognizer.recognize(str,modelUrl,function (err, intents,entities) {

            if (err) {
                reject('got luis err: ' + err);
            }
            else {
                var intentName = getIntentName(intents)
                var path = "./generated/" + intentName + '.js';
                var intent = intentsData[intentName];

                fs.exists(path, function(exists) {

                    if (exists === false) {

                        generateCode(intent,path, function () {
                            var func = require(path);
                            console.log('got func: ' + func());
                            resolve(func());
                        })
                    }
                    else {
                        var func = require(path);
                        console.log('got func: ' + func());
                        resolve(func());
                    }

                });
            }
        });
    });
}



function getIntentName(intents) {
    return intents[0].intent;
}

function generateCode(intent, path, onSuccess) {
    npm.load(function(err) {

        // install module
        npm.commands.install([intent.require], function(er, data) {
            // log errors or data
            if (er) {
                console.log("could not install npm module: " + intent.require);
            }
            else { // create the file
                fs.writeFile(path, intent.code, function(err) {
                    if(err) {
                        console.log('could not create file: ' + path);
                        return console.log(err);
                    }
                    else {
                        console.log("The file was saved!");
                        onSuccess();
                    }
                });
            }
        });

        //npm.on('log', function(message) {
        //    // log installation progress
        //    console.log(message);
        //});
    });
}