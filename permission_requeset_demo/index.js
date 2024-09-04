const permissionTypes = ['media',
  'geolocation',
  'pointerLock',
  'download',
  'filesystem',
  'fullscreen',
  'hid',
  'newwindow',
];

const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
const allowValues = document.getElementById('leftValues');
const denyValues = document.getElementById('rightValues');

let eventCount = 1;

function addToSelect(select, options) {
  options.forEach((o) => { select.add(new Option(o)); });
};

addToSelect(denyValues, permissionTypes);

btnLeft.addEventListener('click', function () {
  const selectedIndexDescending = Array.from(denyValues.selectedOptions).map((e) => { return e.index }).sort().reverse();
  const selectedValues = Array.from(denyValues.selectedOptions).map((e) => { return e.value; });
  selectedValues.forEach((e) => { allowValues.add(new Option(e)); });
  selectedIndexDescending.forEach((e) => { denyValues.remove(e); });
});

btnRight.addEventListener('click', function () {
  const selectedIndexDescending = Array.from(allowValues.selectedOptions).map((e) => { return e.index }).sort().reverse();
  const selectedValues = Array.from(allowValues.selectedOptions).map((e) => { return e.value; });
  selectedValues.forEach((e) => { denyValues.add(new Option(e)); });
  selectedIndexDescending.forEach((e) => { allowValues.remove(e); });
});

function report(message, color = 'yellow') {
  const reportElement = document.getElementById('report');
  reportElement.textContent = message;
  reportElement.style.color = color;
};
function logEvent(message) {
  const reportElement = document.getElementById('event_logger');
  reportElement.textContent = message;
}

const controlledframe = document.createElement('controlledframe');

controlledframe.addEventListener('permissionrequest', function (e) {
  logEvent(`event #${eventCount++}: ${e.permission}`);
  console.log(`event #${eventCount++}: ${e.permission}`);
  const allowedValues = Array.from(allowValues.options).map((e) => { return e.value; });
  const deniedValues = Array.from(denyValues.options).map((e) => { return e.value; });
  if (allowedValues.includes(e.permission)) {
    report('allowing permission: ' + e.permission, 'green');
    console.log('allowing permission: ' + e.permission, allowedValues);
    e.request.allow();
    return;
  }
  if (deniedValues.includes(e.permission)) {
    report('denying permission: ' + e.permission, 'red');
    console.log('denying permission: ' + e.permission, deniedValues);
    e.request.deny();
    return;
  }
  report('Unexpected permission: ' + e.permission);
});

controlledframe.addEventListener('newwindow', function (e) {
  logEvent(`event #${eventCount++}: newwindow`);
  console.log(`event #${eventCount++}: newwindow`);

  const newWindow = window.open('/new_window.html');


  const allowedValues = Array.from(allowValues.options).map((e) => { return e.value; });
  const deniedValues = Array.from(denyValues.options).map((e) => { return e.value; });
  if (allowedValues.includes('newwindow')) {
    report('allowing permission: newwindow', 'green');
    console.log('allowing permission: newwindow', allowedValues);

    const newcontrolledframe = document.createElement('controlledframe');
    // Attach the new window to the new <controlledframe>.
    e.window.attach(newcontrolledframe);
    newWindow.onload = function () { newWindow.document.body.appendChild(newcontrolledframe); };
    return;
  }
  if (deniedValues.includes('newwindow')) {
    report('denying permission: newwindow', 'red')
    console.log('denying permission: newwindow', deniedValues);
    return
  }
  report('newwindow not handled');
});

controlledframe.addEventListener('dialog', function (e) {
  logEvent(`event #${eventCount++}: dialog(${e.messageType})`);
  console.log(`event #${eventCount++}: dialog(${e.messageType})`);
  const allowedValues = Array.from(allowValues.options).map((e) => { return e.value; });
  const deniedValues = Array.from(denyValues.options).map((e) => { return e.value; });

  let text = '';
  text = (allowedValues.includes('dialog')) ? 'allowed' : text;
  text = (deniedValues.includes('dialog')) ? 'denied' : text;

  console.log(e.messageType);
  const ret = window[e.messageType](`***THIS IS AN INTERCEPTED DIALOG***\norigin_message:\n${e.messageText}`);

  if (ret) {
    report(`Dialog(${e.messageType}):\n${e.messageText}\nOkay-ed`, 'green');
    if (e.messageType == 'confirm' || e.messageType == 'alert') {
      e.dialog.ok();
    }
    else if (e.messageType == 'prompt') {
      e.dialog.ok(ret);
    }
    return;
  }
  else {
    report(`Dialog(${e.messageType}):\n${e.messageText}\nCanceled`, 'red');
    e.dialog.cancel();
    return;
  }

  report('dialog not handled');
});

// force reload every time
var rand = Math.floor((Math.random() * 1000000) + 1);
controlledframe.setAttribute('src', 'http://127.0.0.1:8080/controlled_frame.html?uid=' + rand);
// controlledframe.setAttribute('src', 'https://permission.site');
document.body.appendChild(controlledframe);