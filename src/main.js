import RemNoteAPI from 'remnote-api';
import * as RemNoteUtil from 'remnote-api/util';
import { makeSchedule } from './lib/remnote-schedule';

import feather from 'feather-icons';

window.rapi = RemNoteAPI.v0;
window.rutil = RemNoteUtil;

// Custom config handling.
const defaultSettings = {
  scheduleName: 'Schedule',
  startTime: 600,
  endTime: 2200,
  autoReload: 5000,
};

const settings = RemNoteUtil.getPluginSettings(location.search, defaultSettings);
console.log('SETTINGS', settings);

const autoReloadEnabled = settings.autoReload > 0;
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

function reload() {
  makeSchedule('#schedule', settings);
}
reload();
updateReloadIcon();

if (autoReloadEnabled) {
  reloadIntervalHandle = setInterval(reload, settings.autoReload);

  reloadButton.addEventListener('click', () => {
    isAutoReloading = !isAutoReloading;
    clearInterval(reloadIntervalHandle);
    if (isAutoReloading) {
      reloadIntervalHandle = setInterval(reload, settings.autoReload);
      reload();
    }
    updateReloadIcon();
  });
} else {
  reloadButton.addEventListener('click', reload);
}
