const capabilities = ['camera',
  'microphone',
  'geolocation',
  'pointerlock',
  'download',
  'filesystem',
  'fullscreen',
  'hid',
  'newwindow',
  'dialog'
];

let requestFunctions = {};
requestFunctions.fullscreen = function () {
  if (document.fullscreenElement) {
    console.log('FAIL: Already fullscreen');
    return;
  }
  document.body.requestFullscreen();
};

requestFunctions.geolocation = function () {

  document.getElementById('geolocation_result').textContent = "Awaiting Geolocation";
  document.getElementById('geolocation_result').style.color = 'color';

  const options = {
    enableHighAccuracy: false,
    timeout: 3000,
    maximumAge: 0,
  };

  function good(p) {
    document.getElementById('geolocation_result').textContent = JSON.stringify(p.toJSON());
    document.getElementById('geolocation_result').style.color = 'green';
  };

  function bad(e) {
    document.getElementById('geolocation_result').textContent = 'Error: ' + e.message;
    document.getElementById('geolocation_result').style.color = 'red';
  }
  ;

  navigator.geolocation.getCurrentPosition(good, bad, options);

};
requestFunctions.camera = function () {
  const video = document.getElementById('video');
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
};
requestFunctions.microphone = function () {
  // const video = document.getElementById('video');
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);
      const audio = new Audio();
      audio.srcObject = dest.stream;
      audio.autoplay = true;
    })
};
requestFunctions.pointerlock = function () { document.body.requestPointerLock(); };
requestFunctions.download = function () {
  const link = document.createElement("a");
  link.download = 'downloadtest.txt';
  link.href = 'downloadtest.txt';
  link.click();
};

requestFunctions.filesystem = function () {
  console.log('filesystem entered');
  window.requestFileSystem = window.requestFileSystem ||
    window.webkitRequestFileSystem;

  if (!window.requestFileSystem) {
    throw new Error("FAILURE: This browser does not support requestFileSystem.");
  }

  const fileName = document.getElementById('filesystem_file_name').value;
  const fileContent = document.getElementById('filesystem_file_content').value;

  const storageType = window.PERSISTENT;
  const requestedBytes = 1024 * 1024;
  function sCallback(fs) {
    fs.root.getDirectory(
      "Documents",
      { create: true },
      (directoryEntry) => {console.log('dirEn', directoryEntry);
      const reader = directoryEntry.createReader();
      reader.readEntries((a)=>{console.log('array', a)});
    });  


    // Create the file.
    fs.root.getFile(fileName, {create: true}, function(fileEntry) {
      console.log('entry', fileEntry);
      // Create a FileWriter object for writing content to the file.
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function() {
          console.log('File created successfully!');
        };

        fileWriter.onerror = function(e) {
          console.error('Error creating file:', e);
        };

        // Create a Blob object representing the file content.
        var blob = new Blob([fileContent], {type: 'text/plain'});

        // Write the Blob to the file.
        fileWriter.write(blob);
      });
    }, function(error) {
      console.error('Error getting file:', error);
    });
  };
  function fCallback(e) {
    console.log("fs error");
    throw e;
  };

  window.requestFileSystem(storageType, requestedBytes, sCallback, fCallback);

};

requestFunctions.hid = function () { };
requestFunctions.newwindow = function () {
  var url;
  try{

    url = new URL(document.getElementById('newwindow_url').value);
  }catch(_){
   url = new URL(document.getElementById('newwindow_url').value, location.origin);
  }
  window.open(url);
};
requestFunctions.dialog = function () {
  const type = document.getElementById('dialog_type').value;
  const ret = window[type](document.getElementById('dialog_text').value);
};





function clickWrapper(name) {
  try {
    requestFunctions[name]();
  } catch (e) {
    console.log(name);
    console.log(document.getElementById(`${name}_bug`));
    document.getElementById(`${name}_bug`).textContent = e.message;
    console.log(e);
    return;
  }
  document.getElementById(`${name}_bug`).textContent = `${name} requested`;
}



function bindButton(name) {
  const btn = document.getElementById(name);
  if (!requestFunctions[name]) {
    console.log(name);
  }
  btn.addEventListener('click', (e) => { clickWrapper(name); });
}

capabilities.forEach((t) => { bindButton(t) });