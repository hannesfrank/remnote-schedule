import * as remnoteSchedule from './remnote-schedule';
import schedule from '../../data/demo-schedule.json';
import singleColumn from '../../data/demo-schedule-single.json';

test('eventRegex to match events', () => {
  schedule.map(({ raw, isEvent, parsed }) => {
    expect(remnoteSchedule.eventRegex.test(raw)).toBe(isEvent);
    if (isEvent) {
      let match = remnoteSchedule.eventRegex.exec(raw);
      expect(match[1]).toBe(parsed.start);
      expect(match[2]).toBe(parsed.end);
      expect(match[3]).toBe(parsed.event);
    }
  });
});

test('sortSchedule into single column', () => {
  const processedSchedule = schedule
    .map((el) => Object.assign({}, el.processed))
    .filter((el) => el.start);
  expect(remnoteSchedule.sortScheduleSingleColumn(processedSchedule)).toEqual(singleColumn);
});

test('startTime', () => {
  // Default times are 600 - 2200
  expect(remnoteSchedule.startTime([{ start: '800' }])).toBe(remnoteSchedule.DEFAULT_START_TIME);
  expect(remnoteSchedule.startTime([{ start: '600' }])).toBe(remnoteSchedule.DEFAULT_START_TIME);
  expect(remnoteSchedule.startTime([{ start: '500' }])).toBe(500);

  expect(remnoteSchedule.endTime([{ end: '800' }])).toBe(remnoteSchedule.DEFAULT_END_TIME);
  expect(remnoteSchedule.endTime([{ end: '2200' }])).toBe(remnoteSchedule.DEFAULT_END_TIME);
  expect(remnoteSchedule.endTime([{ end: '2400' }])).toBe(2400);
});

test('HHMMtoLinear', () => {
  expect(remnoteSchedule.HHMMtoLinear(700)).toBe(700);
  expect(remnoteSchedule.HHMMtoLinear(730)).toBe(750);
  expect(remnoteSchedule.HHMMtoLinear(2245)).toBe(2275);
});

test('resolveTimeShortcuts', () => {
  let parsedSchedule = schedule.map((el) => Object.assign({}, el.parsed)).filter((el) => el.start);
  let processedSchedule = schedule
    .map((el) => Object.assign({}, el.processed))
    .filter((el) => el.start);

  parsedSchedule = remnoteSchedule.resolveTimeFormatting(parsedSchedule);

  for (let i = 0; i < parsedSchedule.length; i++) {
    const { start, end } = parsedSchedule[i];
    const { start: start2, end: end2 } = processedSchedule[i];
    expect(start).toBeCloseTo(start2);
    expect(end).toBeCloseTo(end2);
  }
});
