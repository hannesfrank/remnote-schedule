const SVG_WIDTH = 400;
const SVG_HEIGHT = 600;
const H = 600; // svg viewport height
const W = 400; // svg viewport width
const FONT_SIZE = 8;
const TIME_MARGIN = 3;
const MARGIN_TOP = FONT_SIZE + 2 * TIME_MARGIN;
const MARGIN_BLOCK_LEFT = 40;
const MARGIN_BLOCK_RIGHT = TIME_MARGIN;

const START_TIME = 6;
const END_TIME = 22;

var demo_schedule = [
  {
    startTime: 9,
    endTime: 9.5,
    event: 'coffee',
  },
  {
    startTime: 9.5,
    endTime: 10,
    event: 'walk',
  },
];

async function drawSchedule(schedule) {
  const svg = d3
    .select('#schedule')
    .append('svg')
    .style('border', '1px solid black')
    .attr('height', SVG_HEIGHT)
    .attr('width', SVG_WIDTH)
    .attr('viewBox', `0 0 ${W} ${H}`);

  const hours = d3.range(START_TIME, END_TIME);

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
    .text((d) => d + ':00');

  function timeToY(d) {
    return ((d - START_TIME) * (H - MARGIN_TOP)) / (END_TIME - START_TIME) + MARGIN_TOP;
  }
  function durationToDY(d) {
    return (d / (END_TIME - START_TIME)) * (H - MARGIN_TOP);
  }

  svg
    .selectAll('rect')
    .data(schedule)
    .enter()
    .append('rect')
    .attr('class', 'block')
    .attr('x', (d) => MARGIN_BLOCK_LEFT)
    .attr('y', (d) => timeToY(d.startTime))
    .attr('fill', (d) => d.color || 'rgb(200, 50, 50, 0.2)')
    .attr('width', W - MARGIN_BLOCK_LEFT - MARGIN_BLOCK_RIGHT)
    .attr('height', (d) => durationToDY(d.endTime - d.startTime));
}

async function loadSchedule() {
  const documentRem = await getDocument();
  //   const tags = await Promise.all(documentRem.tagParents.map((remId) => RemNoteAPI.v0.get(remId)));
  //   console.log(tags);
  // console.log(documentRem);
  // const children = await getChildren(documentRem);
  // console.log(children);
  // What I try to do:
  // console.log(
  //   'name',
  //   await RemNoteAPI.v0.get_by_name('Schedule', { parentId: 'z7ryrB4ThzSG2Pk8S' })
  // );
  // // The result I'm expecting using 'get' instead of 'name
  // let scheduleId = 'oGpv8WsJ9rFsh4QFE';
  // console.log('get', await RemNoteAPI.v0.get(scheduleId));
  const children = await getVisibleChildren(documentRem);
  console.log(children);
  const items = children.map((c) => getRemText(c));

  return demo_schedule;
}
// drawSchedule(demo_schedule);
let schedule = loadSchedule();
drawSchedule(schedule);
