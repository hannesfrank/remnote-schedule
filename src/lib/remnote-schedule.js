import * as RemNoteUtil from 'remnote-api/util';
import * as d3 from 'd3';

const SVG_WIDTH = 400;
const SVG_HEIGHT = 600;
const H = 600; // svg viewport height
const W = 400; // svg viewport width
const FONT_SIZE = 10;
const TIME_MARGIN = 3; // how much to move time text above line
const MARGIN_TOP = FONT_SIZE + 2 * TIME_MARGIN;
const MARGIN_BLOCK_LEFT = 40;
const MARGIN_BLOCK_RIGHT = TIME_MARGIN;

export const DEFAULT_START_TIME = 600;
export const DEFAULT_END_TIME = 2200;

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

export async function drawSchedule(events, targetId) {
  // console.log(events);
  const svg = d3
    .select(targetId)
    .append('svg')
    .style('border', '1px solid black')
    .attr('height', SVG_HEIGHT)
    .attr('width', SVG_WIDTH)
    .attr('viewBox', `0 0 ${W} ${H}`);

  const hours = d3.range(DEFAULT_START_TIME, DEFAULT_END_TIME, 100);

  function timeToY(d) {
    return (
      ((d - DEFAULT_START_TIME) * (H - MARGIN_TOP)) / (DEFAULT_END_TIME - DEFAULT_START_TIME) +
      MARGIN_TOP
    );
  }
  function durationToDY(d) {
    return (d / (DEFAULT_END_TIME - DEFAULT_START_TIME)) * (H - MARGIN_TOP);
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
    .text((d) => Math.floor(d / 100) + ':00');

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

export let eventRegex = /^([0-9]{1,4}|x)\s*,\s*([0-9]{1,4}|\+[0-9]+)\s*,\s*(.*$)/;

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

export async function loadSchedule(scheduleName = DEFAULT_SCHEDULE_NAME) {
  const documentRem = await RemNoteUtil.getDocument();
  //   const tags = await Promise.all(documentRem.tagParents.map((remId) => RemNoteAPI.v0.get(remId)));
  //   console.log(tags);
  // This finds any of multiple schedules...
  // const scheduleParent = await RemNoteAPI.v0.get_by_name(scheduleName, {
  //   parentId: documentRem._id,
  // });
  // TODO: We need get_by_name if we want to configure the plugin.
  // console.log('name', await RemNoteAPI.v0.get_by_name('Schedule', { parentId: documentRem._id }));
  let children = await RemNoteUtil.getChildren(documentRem, true);
  await RemNoteUtil.loadText(children);
  const scheduleParent = children.filter((c) => c.text === scheduleName)[0];
  const timeBlocks = await RemNoteUtil.getVisibleChildren(scheduleParent);
  await RemNoteUtil.loadText(timeBlocks);

  let events = [];
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
    }
  }
  // console.log('Raw', events);
  return events;
}

// Assume resolved time formatting.
export function startTime(schedule) {
  return Math.max(0, Math.min(...schedule.map((block) => block.start), DEFAULT_START_TIME));
}

// Assume resolved time formatting
export function endTime(schedule) {
  return Math.min(Math.max(DEFAULT_END_TIME, ...schedule.map((block) => block.end)), 2400);
}

/**
 * In HHMM the MM part is in range 00..59, but we want it to be 00..99.
 * @param {number|string} time
 */
export function HHMMtoLinear(time) {
  const minutes = time % 100;
  return time - minutes + (minutes / 60) * 100;
}

/**
 */
export function resolveTimeFormatting(schedule) {
  let lastEndTime = undefined;

  return schedule.map((block) => {
    if (block.start === 'x' && lastEndTime === undefined) {
      // This should not happen. I map the start time to default.
      block.start = DEFAULT_START_TIME;
    } else if (block.start === 'x') {
      block.start = lastEndTime;
    } else {
      block.start = HHMMtoLinear(block.start);
    }
    if (block.end.startsWith('+')) {
      const minutes = parseInt(block.end);
      block.end = block.start + HHMMtoLinear(minutes);
    } else {
      block.end = HHMMtoLinear(block.end);
    }
    lastEndTime = block.end;
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

export async function run(targetId = '#schedule') {
  let schedule = await loadSchedule();
  resolveTimeFormatting(schedule);
  let column = sortScheduleSingleColumn(schedule);
  drawSchedule(column, targetId);
}
