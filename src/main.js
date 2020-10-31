import RemNoteAPI from 'remnote-api';
import * as RemNoteUtil from 'remnote-api/util';
import {
  loadSchedule,
  resolveTimeFormatting,
  sortScheduleSingleColumn,
  drawSchedule,
} from './lib/remnote-schedule';

import feather from 'feather-icons';

window.rapi = RemNoteAPI.v0;
window.rutil = RemNoteUtil;

// Custom config handling.
const defaultSettings = {
  scheduleName: 'Schedule',
  start: 600,
  end: 2200,
  autoReload: 5000,
};

// const settings = Object.assign(defaultSettings, RemNoteUtil.getSettings());
const settings = defaultSettings;

const autoReloadEnabled = settings.reloadInterval > 0;
const reloadButton = document.getElementById('reload');
let isAutoReloading = autoReloadEnabled;
const RELOAD_ICON = feather.icons['refresh-cw'].toSvg();
const PAUSE_ICON = feather.icons['pause'].toSvg();
let reloadIntervalHandle;

function updateReloadIcon() {
  if (isAutoReloading || !autoReloadEnabled) {
    reloadButton.innerHTML = RELOAD_ICON;
  } else {
    reloadButton.innerHTML = PAUSE_ICON;
  }
}

async function doReload() {
  console.info('Reloading remnote-schedule.');
  let schedule = await loadSchedule(settings.scheduleName);
  resolveTimeFormatting(schedule);
  let column = sortScheduleSingleColumn(schedule);

  // TODO: Use D3.js enter/exit mechanism instead of deleting everything.
  document.getElementById('schedule').innerHTML = '';
  drawSchedule(column, '#schedule');
}

doReload();
updateReloadIcon();

if (autoReloadEnabled) {
  reloadIntervalHandle = setInterval(doReload, reloadInterval);

  reloadButton.addEventListener('click', () => {
    isAutoReloading = !isAutoReloading;
    clearInterval(reloadIntervalHandle);
    if (isAutoReloading) {
      reloadIntervalHandle = setInterval(doReload, reloadInterval);
      doReload();
    }
    updateReloadIcon();
  });
} else {
  reloadButton.addEventListener('click', doReload);
}
