(function(ext) {

    let connected = false;

    let hostURL = '';
    let blinkURL = 'blink';
    let ledColorURL = 'led/color';
    let speakURL = 'speak';
    let eyeVisibilityURL = 'eye';
    let moveURL = 'move';
    let captureURL = 'photo';

    ext._shutdown = function() {};

    ext._getStatus = function() {
        let status = {status: 2, msg: 'Ready'};
        if(connected) {
          status = {status: 2, msg: 'Ready'};
        } else {
          status = {status: 1, msg: 'Jibo not connected'};
        }
        return status;
    };

    ext.connectToJibo = function (host, callback) {
      sendRequest(host, 'ip', function (responseText) {
        if(!responseText) {
          callback(false);
          return;
        }
        if(responseText.length > 0) {
          connected = true;
          hostURL = host;
          callback(true);
          return;
        }
      });
    };

    ext.blink = function(callback) {
      console.log(hostURL + blinkURL);
      sendRequest(hostURL + blinkURL, null, function(responseText) {
        callback();
      });
    }

    ext.setLEDColor = function(red, green, blue, callback) {
      let params = '?red=' + red + '&green=' + green + '&blue=' + blue;
      sendRequest(hostURL + ledColorURL, params, function(responseText) {
        callback();
      });
    }

    ext.speak = function(phrase, callback) {
      let params = '?words=' + phrase;
      sendRequest(hostURL + speakURL, params, function(responseText) {
        callback();
      });
    }

    ext.showEye = function(show, callback) {
      let params = '?show=' + show;
      sendRequest(hostURL + eyeVisibilityURL, params, function(responseText) {
        callback();
      });
    }

    function sendRequest(requestURL, params, callback) {
      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          if(callback != undefined) {
              callback(request.responseText);
          }
        }
      }
      if(params != null) {
        request.open("GET", requestURL+params, true);
      } else {
        request.open("GET", requestURL, true);
      }
      request.send();
    };

    function findRobots(baseIP, port) {
      robots = [];
      for(let ip = 1; ip < 256; ip++) {
        let testIP = 'http://' + baseIP + ip + ':'+port+'/';
        sendRequest(testIP, 'ip', function(response) {
          if (response.length > 1) {
            console.log('Robot found at: ' + response);
            robots.push('http://' + response + '/');
          }
        })
      }
    }

    ext.lookat = function(direction, callback) {
        if(direction == 'left') {
          sendRequest('http://localhost:3000/lookat', null, function(response) {
            callback()
          })
        }
    }

    function getLocalIP() {
        let deferred = $.Deferred();
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
        let pc = new RTCPeerConnection({iceServers: []}), noop = function () {
        };
        pc.createDataChannel("");    //create a bogus data channel
        pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
        pc.onicecandidate = function (ice) {  //listen for candidate events
            if (!ice || !ice.candidate || !ice.candidate.candidate)  return;
            let regex = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;
            let candidate = ice.candidate.candidate;
            let localIp = candidate.match(regex)
            pc.onicecandidate = noop;
            deferred.resolve(localIp[0]);
        };
        return deferred.promise();
    }

    ext.moveLeft = function(callback) {
      ext.lookAt(1, -1, 1, callback);
    }

    ext.moveRight = function(callback) {
      ext.lookAt(1, 1, 1, callback);
    }

    ext.faceForward = function(callback) {
      ext.lookAt(1, 0, 1, callback);
    }

    ext.captureImage = function(callback) {
      let camera = 'camera=left';
      let distortion = '&distortion=false';
      let resolution = '&resolution=MEDIUM';
      let params = '?' + camera + distortion + resolution;
      sendRequest(hostURL + captureURL, params, function (response) {
        if(!response) {
          callback(null);
          return;
        }
        response = JSON.parse(response);
        if (!response.success) {
          callback(null);
          return;
        }
        console.log(response.imgData);
        callback(response.imgData);
      });
    }


    // Block and block menu descriptions
    let descriptor = {
        blocks: [
          ['w', 'Connect to Jibo at %s', 'connectToJibo', 'http://localhost:3000/'],
          ['w', 'Blink', 'blink'],
          ['w', 'speak %s', 'speak', ''],
          ['w', 'Set LED color R:%n G:%n B:%n', 'setLEDColor', '', '', ''],
          ['w', 'Show Eye %m.trueFalse', 'showEye', 'true'],
          ['w', 'Look left', 'moveLeft'],
          ['w', 'Look right', 'moveRight'],
          ['w', 'Look forward', 'faceForward'],
          ['w', 'Look at x: %n y: %n z: %n', 'lookAt', '1', '0', '1'],
          ['w', 'take photo', 'captureImage']
        ],
        menus: {
          trueFalse: ['true', 'false']
        }
    };

    // getLocalIP().then(function (localIp) {
    //         let baseIp = localIp.substr(0, localIp.lastIndexOf('.') + 1);
    //         findRobots(baseIp, 3000);
    //         return;
    //       });

    // Register the extension
    ScratchExtensions.register('Jibo extension', descriptor, ext);
})({});
