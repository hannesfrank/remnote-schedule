import { eventRegex } from './remnote-schedule';
import schedule from '../../data/demo-schedule.json';

test('add 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

test('eventRegex to match events', () => {
  schedule.map(({ raw, isEvent, parsed }) => {
    expect(eventRegex.test(raw)).toBe(isEvent);
    if (isEvent) {
      let match = eventRegex.exec(raw);
      expect(match[1]).toBe(parsed.start);
      expect(match[2]).toBe(parsed.end);
      expect(match[3]).toBe(parsed.event);
    }
  });
});
