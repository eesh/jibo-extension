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
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "text": phrase,
              "timestamp": Date.now()
            },
            "type":"tts",
            "id":"8iziqydahmxoosr78pb8zo"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
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
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              'x': x,
              'y': y,
              'z': z,
              "timestamp": Date.now()
            },
            "type":"lookAt3D",
            "id":"luzbwwsphl5yc5gd35ltp"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    ext.lookAtAngle = function(direction, callback) {
      var angle = null;
      var id = null;
      switch(direction) {
        case 'left':
          angle = 1.57;
          id = 'gyv2w5gmd1fx3dsi1ya2q';
        case 'right':
          angle = -1.57;
          id = '37puq9rz3u9dktwl4dta3f';
        case 'center':
          angle = 0;
          id = 'x2xbfg17pfe7ojng9xny5l';
        case 'back':
          angle = 3.14;
          id = 'rdar1z5itp854npicluamx';
      }
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "angle": angle,
              "timestamp": Date.now()
            },
            "type":"lookAt",
            "id": id
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    ext.captureImage = function(url, callback) {
      // let camera = 'camera=left';
      // let distortion = '&distortion=false';
      // let resolution = '&resolution=MEDIUM';
      // let params = '?' + camera + distortion + resolution;
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "url": url,
              "timestamp": Date.now()
            },
            "type":"photo",
            "id":"ir49rvv4v42nm8ledkdso"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    ext.setAttention = function (attention, callback) {
      var state = 'idle';
      var id = 'etsolxdeclmkj3nhjp3kb';
      if(attention == 'off') {
        state = 'OFF';
        id = '53v5yx4f99kqkdfcj4hf4';
      }
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "state": state,
              "timestamp": Date.now()
            },
            "type":"attention",
            "id":id
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    ext.playAnimation = function(filePath, callback) {
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "filePath": filePath,
              "timestamp": Date.now()
            },
            "type":"animation",
            "id": 'fnqo3l6m1jjcrib7sz0xyc'
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    // Block and block menu descriptions
    let descriptor = {
        blocks: [
          ['w', 'Connect to Jibo at %s', 'connectToJibo', 'ws://127.0.0.1:8888/'],
          ['w', 'Blink', 'blink'],
          ['w', 'speak %s', 'speak', ''],
          ['w', 'Set LED color R:%n G:%n B:%n', 'setLEDColor', '', '', ''],
          ['w', 'Show Eye %m.trueFalse', 'showEye', 'true'],
          ['w', 'Look %m.lookAt', 'lookAtAngle', 'center'],
          ['w', 'Look at x: %n y: %n z: %n', 'lookAt', '1', '0', '1'],
          ['w', 'Turn attention %m.onOff', 'setAttention', 'on'],
          ['w', 'Play animation %s', 'playAnimation', ''],
          ['w', 'take photo at url %s', 'captureImage', '']
        ],
        menus: {
          lookAt: ['left', 'right', 'center', 'back'],
          trueFalse: ['true', 'false'],
          onOff: ['on', 'off']
        }
    };

    // Register the extension
    ScratchExtensions.register('Jibo extension', descriptor, ext);
})({});
