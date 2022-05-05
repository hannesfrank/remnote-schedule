import * as RemNoteUtil from 'remnote-api/util';
import * as d3 from 'd3';

const SVG_HEIGHT = 600;
const H = SVG_HEIGHT; // svg viewport height
const SVG_WIDTH = 400;
const W = SVG_WIDTH; // svg viewport width
const FONT_SIZE = 8;
const TIME_MARGIN = 3; // how much to move time text above line
const MARGIN_TOP = FONT_SIZE + 2 * TIME_MARGIN;
const MARGIN_BLOCK_LEFT = 40;
const MARGIN_BLOCK_RIGHT = TIME_MARGIN;
const NOTIFICATION_THRESHOLD = 0;


// Generated with https://mokole.com/palette.html
// const COLOR_MAP = [
//   '#2f4f4f',
//   '#228b22',
//   '#00008b',
//   '#b03060',
//   '#ff4500',
//   '#ffff00',
//   '#00ff00',
//   '#00ffff',
//   '#ff00ff',
//   '#ffe4b5',
// ];

export async function drawSchedule(events, targetId, startTime, endTime) {
  // console.log(events);
  const svg = d3
    .select(targetId)
    .append('svg')
    .style('border', '1px solid black')
    .attr('height', SVG_HEIGHT)
    .attr('width', SVG_WIDTH)
    .attr('viewBox', `0 0 ${W} ${H}`);

  const hours = d3.range(startTime, endTime, 25);
  const scheduleDuration = endTime - startTime;

  function timeToY(d) {
    return ((d - startTime) / scheduleDuration) * (H - MARGIN_TOP) + MARGIN_TOP;
  }
  function durationToDY(d) {
    return (d / scheduleDuration) * (H - MARGIN_TOP);
  }

  function timeToHourMarkerY(d) {
    return Math.floor(d/100) + ":" + String((d % 100) / 100 * 60).padStart(2, '0');
  }

  svg
    .selectAll('line')
    .data(hours)
    .enter()
    .append('line')
    .attr('class', 'time')
    .attr('x1', 0)
    .attr('y1', (d) => timeToY(d))
    .attr('x2', W)
    .attr('y2', (d) => timeToY(d));

  svg
    .selectAll('text')
    .data(hours)
    .enter()
    .append('text')
    .attr('class', 'time')
    .attr('x', (d) => 2 * TIME_MARGIN) // more space to left than to line below
    .attr('y', (d) => timeToY(d) - TIME_MARGIN)
    .text((d) => timeToHourMarkerY(d));

  svg
    .selectAll('rect')
    .data(events)
    .enter()
    .append('rect')
    .attr('class', (d) => ['block', d.tags].join(' '))
    .attr('x', (d) => MARGIN_BLOCK_LEFT)
    .attr('y', (d) => timeToY(d.start))
    .attr('fill', (d) => d.color || 'rgb(130, 180, 250)')
    .attr('width', W - MARGIN_BLOCK_LEFT - MARGIN_BLOCK_RIGHT)
    .attr('height', (d) => durationToDY(d.end - d.start));

  svg
    .selectAll('text .block')
    .data(events)
    .enter()
    .append('text')
    .attr('class', 'block')
    .attr('x', (d) => MARGIN_BLOCK_LEFT + 1.5 * FONT_SIZE)
    .attr('y', (d) => (timeToY(d.start) + timeToY(d.end)) / 2 + FONT_SIZE / 2)
    .text((d) => d.event);
  // TODO: Nest rect and text inside group

  const now = new Date();
  const nowValue = now.getHours() * 100 + (now.getMinutes() / 60) * 100;
  svg
    .selectAll('line .now')
    .data([nowValue])
    .enter()
    .append('line')
    .attr('class', 'now')
    .attr('x1', 0)
    .attr('y1', (d) => timeToY(d))
    .attr('x2', W)
    .attr('y2', (d) => timeToY(d));
}

export let eventRegex = /^([0-9:]{1,5}|x)\s*,\s*([0-9:]{1,5}|\+[0-9]+|x)\s*,\s*(.*$)/;

function hashString(str) {
  if (!str) return 0;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export async function loadSchedule(scheduleName) {
  const documentRem = await RemNoteUtil.getDocument();
  //   const tags = await Promise.all(documentRem.tagParents.map((remId) => RemNoteAPI.v0.get(remId)));
  //   console.log(tags);
  // This finds any of multiple schedules...
  // const scheduleParent = await RemNoteAPI.v0.get_by_name(scheduleName, {
  //   parentId: documentRem._id,
  // });
  // TODO: We need get_by_name if we want to configure the plugin.
  let children = await RemNoteUtil.getChildren(documentRem, true);
  await RemNoteUtil.loadText(children);
  const scheduleParent = children.filter((c) => c.text === scheduleName)[0];
  const timeBlocks = await RemNoteUtil.getChildren(scheduleParent, false);
  await RemNoteUtil.loadText(timeBlocks);

  // console.log('Timeblocks', timeBlocks);

  let events = [];
  const DEFAULT_DURATION = '+20';
  for (const block of timeBlocks) {
    await RemNoteUtil.loadTags(block);
    let match = eventRegex.exec(block.text);
    if (match) {
      let [_, start, end, event] = match;
      events.push({
        start,
        end,
        event,
        tags: block.tags,
      });
    } else if (block.text.trim() !== '') {
      // reverse search char in text
      let commaIdx = block.text.lastIndexOf(',');
      // check if string is a number
      let duration = block.text.substring(commaIdx + 1).trim();
      if (commaIdx === -1 || isNaN(parseInt(duration))) {
        events.push({
          start: 'x',
          end: DEFAULT_DURATION,
          event: block.text,
          tags: block.tags,
        });
      } else {
        events.push({
          start: 'x',
          end: '+' + duration,
          event: block.text.substring(0, commaIdx),
          tags: block.tags,
        });
      }
    }
  }
  // console.log('Events copy', JSON.parse(JSON.stringify(events)));
  // console.log('Events', events);
  return events;
}

// TODO: automatically calculate start and end time.
// Assume resolved time formatting.
export function startTime(schedule) {
  const minStart = Math.min(...schedule.map((block) => block.start));
  return Math.floor(minStart / 100) * 100;
}

// Assume resolved time formatting
export function endTime(schedule) {
  const maxEnd = Math.max(...schedule.map((block) => block.end));
  return Math.ceil(maxEnd / 100) * 100;
}

/**
 * In HHMM the MM part is in range 00..59, but we want it to be 00..99.
 * @param {number|string} time
 */
export function HHMMtoLinear(time) {
  if (typeof time === 'string') {
    time = parseInt(time.replace(/:/g, ''), 10);
  }
  const minutes = time % 100;
  return time - minutes + (minutes / 60) * 100;
}


export function resolveTimeFormatting(schedule, startTime, endTime) {
  let lastEndTime = undefined;
  const now = new Date();
  const currentTime = now.getHours() * 100 + (now.getMinutes() / 60) * 100;

  return schedule.map((block) => {
    if (block.start === 'x' && lastEndTime === undefined) {
      // This should not happen. I map the start time to the beginning of the schedule.
      block.start = startTime;
    } else if (block.start === 'x') {
      block.start = lastEndTime;
    } else {
      block.start = HHMMtoLinear(block.start);
    }
    if (block.end.startsWith('+')) {
      const minutes = parseInt(block.end);
      block.end = block.start + HHMMtoLinear(minutes);
    } else if (block.end === 'x') {
      // get current time in hhmm format
      block.end = currentTime;
    } else {
      block.end = HHMMtoLinear(block.end);
    }
    lastEndTime = block.end;
    if (block.end - currentTime < NOTIFICATION_THRESHOLD && block.end - currentTime > 0) {
      sendNotification('Close to end of event', block.event);
    }
    // console.log('Resolved time', block.start, block.end, block.event);
    return block;
  });
}

/**
 * For now this makes a single column where later time blocks overwrite previous ones.
 * TODO: Multi-column
 *
 * @param {[event]} schedule List of time blocks.
 */
export function sortScheduleSingleColumn(schedule) {
  const reversed = [...schedule];
  reversed.reverse();
  const nonOverlappingBlocks = [];

  // TODO: In case a later element is fully within a previous one, i.e. you do A
  // then B then A again this can not be drawn satisfactory. I jsut assume for
  // now this does not happen.

  const inInterval = (time, interval) => interval.start <= time && time <= interval.end;
  for (const block of reversed) {
    for (const int of nonOverlappingBlocks) {
      const { start, end } = int;
      if (inInterval(block.start, int)) {
        block.start = end;
      }
      if (inInterval(block.end, int)) {
        block.end = start;
      }
    }
    if (block.start < block.end) {
      nonOverlappingBlocks.push(block);
    }
  }
  return nonOverlappingBlocks;
}

function sendNotification(title, body) {
  console.log('Notification');
  const notification = new Notification(title, {
    body: body,
  });
  notification.onclick = () => {
    window.open(window.location.href);
  };
}

export async function makeSchedule(targetId, settings) {
  let schedule = await loadSchedule(settings.scheduleName);
  resolveTimeFormatting(schedule, settings.startTime, settings.endTime);
  let column = sortScheduleSingleColumn(schedule);
  // TODO: Use D3.js enter/exit mechanism instead of deleting everything.
  document.getElementById('schedule').innerHTML = '';
  drawSchedule(column, targetId, startTime(schedule), endTime(schedule));
}
