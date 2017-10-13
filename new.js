(function(ext) {

    var connected = false;
    var Bundle = null;
    var socket = null;

    var headTouched = false;
    var headTouches = null;

    var screenTouched = false;
    var screenVector = {};
    var personCount = 0;
    var personVector = null;
    var lastPersonVector = null;
    var motionCount = 0;
    var motionVector = null;
    var lastMotionVector = null;

    var askQuestionCallback = null;



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
         console.log('Connected to jibo app frame');
      }

      socket.onmessage = function(message){
         message = JSON.parse(message.data);
         if(message.name == "blockly.robotList") {
           if(message.type == "robotlist") {
             if(message.data.names.length > 0) {
               connected = true;
             }
           }
         } else {
           if(message.type == 'event') {
             if(message.payload.type == "screen-touch") {
               screenVector = message.payload.data;
               screenTouched = true;
             } else if(message.payload.type == "lps-summary") {
               personCount = message.payload.data.personCount;
               personVector = message.payload.data.personVector;
               motionCount = message.payload.data.motionCount;
               motionVector = message.payload.data.motionVector;
             } else if(message.payload.type == "head-touch") {
               headTouches = message.payload.touches;
               headTouched = true;
             }
           }
         }
         console.log(message);
      }
    }

    ext.onHeadTouch = function() {
      if(headTouched === true) {
        headTouched = false;
        return true;
      }
      return false;
    }

    ext.onScreenTouch = function () {
      if(screenTouched === true) {
        screenTouched = false;
        return true;
      }
      return false;
    }

    ext.onDetectMotion = function () {
      if(motionCount > 0 && motionVector != lastMotionVector && motionVector != null) {
        lastMotionVector = motionVector;
        return true;
      }
      return false;
    }

    ext.onDetectPerson = function () {
      if(personCount > 0 && personVector != lastPersonVector && personVector != null) {
        lastPersonVector = personVector;
        return true;
      }
      return false;
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

    ext.setLEDColorHex = function(hex, callback) {
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "colour": hex,
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


    ext.askQuestion = function(question, callback) {
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "prompt": question,
              "timestamp": Date.now()
            },
            "type":"mim",
            "id":"mnvwvc6ydbjcfg60u5ou"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        askQuestionCallback = callback;
        callback(); // TODO: remove once I get call information
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    // ext.showEye = function(show, callback) {
    //   let params = '?show=' + show;
    //
    // }


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

    ext.showPhoto = function(url, callback) {
      // let camera = 'camera=left';
      // let distortion = '&distortion=false';
      // let resolution = '&resolution=MEDIUM';
      // let params = '?' + camera + distortion + resolution;
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "type": "image/jpeg",
              "url": url,
              "timestamp": Date.now()
            },
            "type":"image",
            "id":"l8yovibh75ca72n67e3"
          }
        };
        socket.send(JSON.stringify(commandMessage));
        callback();
      } else {
        console.log('Not connected');
        callback('Not connected');
      }
    }

    ext.hidePhoto = function(url, callback) {
      // let camera = 'camera=left';
      // let distortion = '&distortion=false';
      // let resolution = '&resolution=MEDIUM';
      // let params = '?' + camera + distortion + resolution;
      if(connected == true) {
        var commandMessage = {
          "type":"command",
          "command": {
            "data": {
              "timestamp": Date.now()
            },
            "type":"hideImage",
            "id":"iuth2xj8a3tkrgk8m6jll"
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

    ext.getMotionCount = function() {
      return motionCount;
    }

    ext.getMotionVectorX = function() {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.x;
    }

    ext.getMotionVectorY = function() {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.y;
    }

    ext.getMotionVectorZ = function() {
      if(motionVector == null) {
        return 0;
      }
      return motionVector.z;
    }

    ext.getPersonCount = function() {
      return personCount;
    }

    ext.getPersonVectorX = function() {
      if(personVector == null) {
        return 0;
      }
      return personVector.x;
    }

    ext.getPersonVectorY = function() {
      if(personVector == null) {
        return 0;
      }
      return personVector.y;
    }

    ext.getPersonVectorZ = function() {
      if(personVector == null) {
        return 0;
      }
      return personVector.z;
    }

    ext.getScreenVectorX = function() {
      if(screenVector == null) {
        return 0;
      }
      return screenVector.x;
    }

    ext.getScreenVectorY = function() {
      if(screenVector == null) {
        return 0;
      }
      return screenVector.y;
    }

    // Block and block menu descriptions
    let descriptor = {
        blocks: [
          ['h', 'On screen touch', 'onScreenTouch'],
          ['h', 'On detect motion', 'onDetectMotion'],
          ['h', 'On detect person', 'onDetectPerson'],
          ['w', 'Connect to Jibo at %s', 'connectToJibo', 'ws://127.0.0.1:8888/'],
          ['w', 'Jibo blink', 'blink'],
          ['w', 'Say: %s', 'speak', ''],
          ['R', 'Ask %s', 'askQuestion', ''],
          ['w', 'Set LED color hex: %s', 'setLEDColorHex', ''],
          ['w', 'Set LED color R:%n G:%n B:%n', 'setLEDColor', '', '', ''],
          ['w', 'Show Eye %m.trueFalse', 'showEye', 'true'],
          ['w', 'Look at: %m.lookAt', 'lookAtAngle', 'center'],
          ['w', 'Look at: x: %n y: %n z: %n', 'lookAt', '1', '0', '1'],
          ['w', 'Turn attention: %m.onOff', 'setAttention', 'on'],
          ['w', 'Play %s', 'playAnimation', ''],
          ['w', 'Take photo, save as: %s', 'captureImage', ''],
          ['w', 'Show %s', 'showPhoto', ''],
          ['w', 'Hide image', 'hidePhoto'],
          ['r', 'moving objects', 'getMotionCount'],
          ['r', 'motion x', 'getMotionVectorX'],
          ['r', 'motion y', 'getMotionVectorY'],
          ['r', 'motion z', 'getMotionVectorZ'],
          ['r', 'number of people', 'getPersonCount'],
          ['r', 'person x', 'getPersonVectorX'],
          ['r', 'person y', 'getPersonVectorY'],
          ['r', 'person z', 'getPersonVectorZ'],
          ['r', 'Screen vector X', 'getScreenVectorX'],
          ['r', 'Screen vector Y', 'getScreenVectorY']
        ],
        menus: {
          lookAt: ['left', 'right', 'center', 'back'],
          trueFalse: ['true', 'false'],
          onOff: ['ON', 'OFF'],
          vectorDimensions2D: ['x' , 'y'],
          vectorDimensions3D: ['x' , 'y', 'z']
        }
    };

    // Register the extension
    ScratchExtensions.register('Jibo extension', descriptor, ext);
})({});
