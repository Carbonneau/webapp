// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START app]
// [START import_libraries]
var google = require('googleapis');
var async = require('async');
var fs = require('fs'); // for audio

// Get a reference to the speech service
var speech = google.speech('v1beta1').speech;
// [END import_libraries]

// [START authenticating]
function getAuthClient (callback) {
  // Acquire credentials
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or a Managed VM, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform'
      ]);
    }

    return callback(null, authClient);
  });
}
// [END authenticating]

// [START construct_request]
exports.prepareRequest = function (req, res) {
  
  //console.log('Got audio file!');
  console.log(req.body.buffer);
  var encoded = req.body.buffer;
  //console.log(encoded);
  // The below code snippet performs the following tasks:
  // 1 Reads the audio data into a variable.
  // 2 Escapes the binary data into text by encoding it in Base64 (JSON does not support the transmission of binary data).
  // 3 Constructs a payload for a recognize request.
  var payload = {
    config: {
      encoding: 'LINEAR16',
      sampleRate: 16000
    },
    audio: {
      content: encoded
    }
  };

}
// [END construct_request]

function main (inputFile, callback) {
  var requestPayload;

  async.waterfall([
    function (cb) {
      prepareRequest(inputFile, cb);
    },
    function (payload, cb) {
      requestPayload = payload;
      getAuthClient(cb);
    },
    // [START send_request]
    // To send the JSON as a POST request to the speech:recognize URL,
    // we need to access a speech resource to perform the recognize() action on it.
    function sendRequest (authClient, cb) {
      //console.log('Analyzing speech...');
      speech.syncrecognize({
        auth: authClient,
        resource: requestPayload
      }, function (err, result) {
        if (err) {
          return cb(err);
        }
        //console.log('result:', JSON.stringify(result, null, 2));
        cb(null, result);
      });
    }
    // [END send_request]
    // The JSON response is displayed on the console.
  ], callback);
}

// [START run_application]
if (module === require.main) {
  if (process.argv.length < 3) {
    //console.log('Usage: node recognize <inputFile>');
    process.exit();
  }
  var inputFile = process.argv[2];
  main(inputFile, console.log);
}
// [END run_application]
// [END app]

exports.main = main;
