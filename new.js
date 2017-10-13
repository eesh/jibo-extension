(function(ext) {

    var connected = false;
    var Bundle = null;
    var socket = null;

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

    function setupSocket() {
      socket.onopen = function() {
         /*Send a small message to the console once the connection is established */
         console.log('Connected to jibo app frame');
      }

      socket.onmessage = function(message){
         var server_message = JSON.parse(message.data);
         if(server_message.name == "blockly.robotList") {
           if(server_message.type == "robotlist") {
             if(server_message.data.names.length > 0) {
               connected = true;
             }
           }
         }
         console.log(server_message);
      }
    }

    ext.connectToJibo = function (host, callback) {
      socket = new WebSocket('ws://127.0.0.1:8888/');
      setupSocket();
      callback();
    };

    ext.blink = function(callback) {
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "timestamp": Date.now()
            },
            "type":"blink",
            "id":"a8oqmako5jup9jkujjhs8n"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }


    ext.setLEDColor = function(red, green, blue, callback) {
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "colour": rgbToHex(red, green, blue),
              "timestamp": Date.now()
            },
            "type":"ringColour",
            "id":"rkj7naw3qhoeqqx75qie8p"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    ext.speak = function(phrase, callback) {
      let params = '?words=' + phrase;

    }

    ext.showEye = function(show, callback) {
      let params = '?show=' + show;

    }

    ext.findRobots = function(callback) {
      if(Backend == null) {
        loadScript();
      }
      Backend.scanForRobots(onNewRobot);
      callback();
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

    ext.lookAt = function(x, y, z, callback) {
      var params = '?x='+x+'&y='+y+'&z='+z;
      callback();
    }

    ext.captureImage = function(callback) {
      let camera = 'camera=left';
      let distortion = '&distortion=false';
      let resolution = '&resolution=MEDIUM';
      let params = '?' + camera + distortion + resolution;
    }

    // Block and block menu descriptions
    let descriptor = {
        blocks: [
          ['w', 'Connect to Jibo at %s', 'connectToJibo', 'ws://127.0.0.1:8888/'],
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

    // Register the extension
    ScratchExtensions.register('Jibo extension', descriptor, ext);
})({});
