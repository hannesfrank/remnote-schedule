import * as RemNoteUtil from './RemNoteUtil';
import RemNoteAPI from 'remnote-api';
import * as d3 from 'd3';
import { interval, stratify } from 'd3';

const SVG_WIDTH = 400;
const SVG_HEIGHT = 600;
const H = 600; // svg viewport height
const W = 400; // svg viewport width
const FONT_SIZE = 8;
const TIME_MARGIN = 3;
const MARGIN_TOP = FONT_SIZE + 2 * TIME_MARGIN;
const MARGIN_BLOCK_LEFT = 40;
const MARGIN_BLOCK_RIGHT = TIME_MARGIN;

export const DEFAULT_START_TIME = 600;
export const DEFAULT_END_TIME = 2200;

export async function drawSchedule(events, targetId) {
  const svg = d3
    .select(targetId)
    .append('svg')
    .style('border', '1px solid black')
    .attr('height', SVG_HEIGHT)
    .attr('width', SVG_WIDTH)
    .attr('viewBox', `0 0 ${W} ${H}`);

  const hours = d3.range(DEFAULT_START_TIME, DEFAULT_END_TIME, 100);

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
    .attr('x', (d) => 2 * TIME_MARGIN)
    .attr('y', (d) => timeToY(d) - TIME_MARGIN)
    .text((d) => Math.floor(d / 100) + ':00');

  function timeToY(d) {
    return (
      ((d - DEFAULT_START_TIME) * (H - MARGIN_TOP)) / (DEFAULT_END_TIME - DEFAULT_START_TIME) +
      MARGIN_TOP
    );
  }
  function durationToDY(d) {
    return (d / (DEFAULT_END_TIME - DEFAULT_START_TIME)) * (H - MARGIN_TOP);
  }

  console.log(events);

  svg
    .selectAll('rect')
    .data(events)
    .enter()
    .append('rect')
    .attr('class', 'block')
    .attr('x', (d) => MARGIN_BLOCK_LEFT)
    .attr('y', (d) => timeToY(d.start))
    .attr('fill', (d) => d.color || 'rgb(200, 50, 50, 0.2)')
    .attr('width', W - MARGIN_BLOCK_LEFT - MARGIN_BLOCK_RIGHT)
    .attr('height', (d) => durationToDY(d.end - d.start));
}

export let eventRegex = /^([0-9]{4}|x),([0-9]{4}|\+[0-9]+),(.*$)/;

export async function loadSchedule() {
  const documentRem = await RemNoteUtil.getDocument();
  //   const tags = await Promise.all(documentRem.tagParents.map((remId) => RemNoteAPI.v0.get(remId)));
  //   console.log(tags);
  // TODO: We need get_by_name if we want to configure the plugin.
  // console.log(
  //   'name',
  //   await RemNoteAPI.v0.get_by_name('Schedule', { parentId: 'z7ryrB4ThzSG2Pk8S' })
  // );
  const children = await RemNoteUtil.getChildren(documentRem, true);
  console.log(children);
  const items = children.map((c) => RemNoteUtil.getRemText(c));
  console.log(items);

  return demo_schedule;
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

export default async function run(targetId = '#schedule') {
  let schedule = await loadSchedule();
  resolveTimeFormatting(schedule);
  column = sortScheduleSingleColumn(schedule);
  drawSchedule(column, targetId);
}
