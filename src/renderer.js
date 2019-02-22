// window.Bootstrap = require('bootstrap');
// noinspection NpmUsedModulesInstalled
import { ipcRenderer } from 'electron';

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

ipcRenderer.on('setPort', (evt, msg) => {
  document.getElementById("port").innerHTML = msg;
});
ipcRenderer.send('getPort');