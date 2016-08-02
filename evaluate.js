/**
 * Created by lancehughes on 7/31/16.
 */

var npm = require('npm');
var fs = require('fs');
var intentsData = require('./intentsData');
var Promise = require('bluebird');
var builder = require('botbuilder');
var config = require('./config');

var modelUrl = config.luisUrl;

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

                            resolve(func());
                        })
                    }
                    else {
                        var func = require(path);

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

        npm.on('log', function(message) {
            // log installation progress
            console.log(message);
        });
    });
}