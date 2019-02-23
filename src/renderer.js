// window.Bootstrap = require('bootstrap');
// noinspection NpmUsedModulesInstalled
import { ipcRenderer } from 'electron';

let autorotateEnabled = false;

function onFormSubmit(e) {
  const d1Host = document.getElementById("div1Host").value;
  const d2Host = document.getElementById("div2Host").value;

  if(d1Host) {
    ipcRenderer.send('divisionSet', {div: '1', host: d1Host});
  }

  if(d2Host) {
    ipcRenderer.send('divisionSet', {div: '2', host: d2Host});
  }
  return false;
}

function onSwitcherFormSubmit(e) {
  const switcherHost = document.getElementById("switcher").value;
  if(switcherHost) {
    ipcRenderer.send('switcherSet', {host: switcherHost});
  }
  return false;
}

function setFullscreen(val) {
  ipcRenderer.send('toggleFullscreen', val);
}

function setResolution(val) {
  ipcRenderer.send('setResolution', val);
}

function setAutorotate(val) {
  autorotateEnabled = val;
  const time = document.getElementById("autorotate-time").value;
  ipcRenderer.send('setAutorotate', { val: val, time: time } );
  document.getElementById('autorotate-button').innerText = autorotateEnabled ? 'Disable autorotate' : 'Enable autorotate'
}


ipcRenderer.on('setPort', (evt, msg) => {
  document.getElementById("port").innerHTML = msg;
});
ipcRenderer.send('getPort');