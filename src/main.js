// noinspection NpmUsedModulesInstalled

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

import { app, BrowserWindow, ipcMain } from 'electron';
import http from 'http';
import url from 'url';
import Stomp from 'stomp-client';

import findFreePort from 'find-free-port';

let win;
const dispWindows = {};

const isOsx = process.platform === "darwin";
let port = '_';
let client;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  win.loadFile('src/index.html');
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null
  });

  findFreePort(8000).then(([freep]) => {

    http.createServer(function(request, response) {
      if(request.method !== 'POST') {
        response.writeHead(405);
        response.end();
        return;
      }
      const parsedUrl = url.parse(request.url, true);
      if(parsedUrl.pathname !== '/setDisplay') {
        response.writeHead(404);
        response.end();
        return;
      }

      if(!parsedUrl.query['display']) {
        response.writeHead(400);
        response.end();
        return;
      }

      const disp = parsedUrl.query['display'];

      if(disp[0] === 'd') {
        if(dispWindows[disp[1]]) {
          dispWindows[disp[1]].show();
        }
      }

      // Set the response HTTP header with HTTP status and Content type
      response.writeHead(200, {'Content-Type': 'application/json'});

      // Send the response body "Hello World"
      response.end(JSON.stringify({status: 'success'}));
    }).listen(freep);

    port = freep;
    win.webContents.send('setPort', port);
  }).catch((err)=>{
    console.error(err);
  });
}

ipcMain.on('getPort', (event, val) => {
  win.webContents.send('setPort', port);
});

ipcMain.on('toggleFullscreen', (event, val) => {
  if(isOsx) {
    Object.values(dispWindows).forEach((w) => w.setSimpleFullScreen(val));
  } else {
    Object.values(dispWindows).forEach((w) => w.setFullScreen(val));
  }
});


ipcMain.on('setResolution', (event, val) => {
  const parts = val.split(',');
  Object.values(dispWindows).forEach((w) => w.setSize(parseInt(parts[0]), parseInt(parts[1])));
});


ipcMain.on('switcherSet', (event, args) => {

  if(args['host']) {
    client = new Stomp(args['host'], 43785, 'user', 'pass');

    client.connect(function() {
      client.subscribe('/display/show', function(body, headers) {

        const disp = body;

        if(dispWindows[disp[0]]) {
          dispWindows[disp[0]].show();
        }
      });
    });
  }
});

ipcMain.on('divisionSet', (event, args) => {

  if(!dispWindows[args['div']]) {
    const pos = win.getPosition();
    dispWindows[args['div']] = new BrowserWindow({
      width: 800, height: 600,
      x: pos[0] + 20,
      y: pos[1] + 20,
      webPreferences: {
        nodeIntegration: false
      }
    });
    // dispWindows[args['div']].webContents.openDevTools();
    dispWindows[args['div']].on('closed', () => {
      dispWindows[args['div']] = null
    });
    dispWindows[args['div']].on('page-title-updated', (evt) => evt.preventDefault());
  }

  dispWindows[args['div']].loadURL(args['host']);
  dispWindows[args['div']].setTitle("DISPLAY WINDOW D" + args['div']);
});


app.on('ready', createWindow);
