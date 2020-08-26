import * as RemNoteUtil from './lib/remnote-util';
import {
  loadSchedule,
  resolveTimeFormatting,
  sortScheduleSingleColumn,
  drawSchedule,
} from './lib/remnote-schedule';

import feather from 'feather-icons';

const config = RemNoteUtil.getURLConfig();
const reloadInterval = parseInt(config.autoreload);
const autoReloadEnabled = reloadInterval > 0;

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
  let schedule = await loadSchedule();
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
