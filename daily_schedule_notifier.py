import logging
import os
import re
import time
from datetime import datetime

import requests

remnote_user_id = 'z6K9rRrPSufvX5f2f'
remnote_api_key = 'd9a6f53161ccf0297b6873383dbe7992'
remnote_api_url = 'https://api.remnote.com/api/v0/'
remnote_api_get_rem = remnote_api_url + 'get'

TIME_LEFT_THRESHOLD = 15
CHECK_INTERVAL_SECS = 5


logging.basicConfig(
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S')


# send a post request to the remnote api
def send_post_request(url, data):
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, json=data, headers=headers)
    return response


# get rem
def get_rem(rem_id):
    logging.info('Getting rem with id: ' + rem_id)
    data = {'userId': remnote_user_id, 'apiKey': remnote_api_key, 'remId': rem_id}
    response = send_post_request(remnote_api_get_rem, data)
    while response.status_code != 200:
        time.sleep(1)
        send_mac_notification('Remnote API error')
        response = send_post_request(remnote_api_get_rem, data)
    return response.json()


# get the current day's schedule
def get_todays_schedule():
    logging.info('Getting todays schedule')
    parent_rem = get_rem('n5rnHJ7EbKHoMEvSb')
    # print(parent_rem)
    queue = [parent_rem]
    first_day_seen = False
    todays_schedule = []
    while len(queue) > 0:
        rem = queue.pop(0)
        if not ((rem['nameAsMarkdown'] == '[[]]' and rem['remType'] == 'default_type')
                or (rem['nameAsMarkdown'] == 'Schedule')
                or (rem['nameAsMarkdown'] == 'Things to do today')):
            continue
        if rem['nameAsMarkdown'] == '[[]]' and rem['remType'] == 'default_type':
            if first_day_seen:
                continue
            first_day_seen = True
        if rem['nameAsMarkdown'] == 'Schedule':
            for child_rem_id in rem['children']:
                child_rem = get_rem(child_rem_id)
                todays_schedule.append(child_rem['nameAsMarkdown'])
            logging.info(todays_schedule)
            return todays_schedule
        for child_rem_id in rem['children']:
            child_rem = get_rem(child_rem_id)
            queue.append(child_rem)
            # print(child_rem)
    logging.info('No schedule found')
    return todays_schedule


# get current and next tasks
def get_current_and_next_tasks(schedule):
    prev_end_time = 0  # in seconds from midnight
    now = datetime.now()
    current_time = now.hour * 3600 + now.minute * 60 + now.second
    # print(current_time)
    ans = {
        'current': {
            'name': None,
            'time_left': None,
            'start_time': None,
            'end_time': None
        },
        'next': {
            'name': None,
            'start_time': None,
            'end_time': None
        }
    }
    for i, task in enumerate(schedule):
        start_time, end_time, task_name = get_task_details(task, prev_end_time)
        # print(start_time, end_time, task_name)
        if task_name is None:
            continue
        prev_end_time = end_time
        if start_time <= current_time < end_time:
            ans['current']['name'] = task_name
            ans['current']['start_time'] = start_time
            ans['current']['end_time'] = end_time
            ans['current']['time_left'] = end_time - current_time
            if i + 1 < len(schedule):
                ans['next']['start_time'], ans['next']['start_time'], ans['next']['end_time'] = get_task_details(
                    schedule[i + 1], prev_end_time)
            return ans
    return ans


p1 = re.compile(r'\s*([\d|:]+),\s*\+(\d+)\s*,\s*(.*)\s*')
p2 = re.compile(r'\s*(.*)\s*,\s*(\d+)\s*')


# get the start time, end time and task name from a task
def get_task_details(task, prev_end_time):
    start_time = None
    end_time = None
    task_name = None
    m1 = p1.match(task)
    m2 = p2.match(task)
    if m1:
        start_time = get_seconds_from_midnight_from_hhmm(m1.group(1))
        end_time = start_time + int(m1.group(2)) * 60
        task_name = m1.group(3)
    elif m2:
        start_time = prev_end_time
        end_time = start_time + get_duration_from_hhmm(int(m2.group(2)))
        task_name = m2.group(1)
    elif len(task) > 0:
        start_time = prev_end_time
        end_time = start_time + 20 * 60
        task_name = task
    return start_time, end_time, task_name


def get_seconds_from_midnight_from_hhmm(hhmm):
    hhmm = hhmm.split(':')
    hh = int(hhmm[0])
    mm = int(hhmm[1])
    return hh * 3600 + mm * 60


def get_duration_from_hhmm(hhmm: int):
    hh = hhmm // 100
    mm = hhmm % 100
    return hh * 3600 + mm * 60


def send_mac_notification(message):
    """
    alerter -message '{}' -closeLabel No -timeout 5 -sound default
    -appIcon ~/Documents/code/GitHub/remnote-schedule/schedule.png -title Plan
    """
    os.system("alerter -message '{}' "
              "-closeLabel No -timeout 15 -sound default "
              "-appIcon ~/Documents/code/GitHub/remnote-schedule/schedule.png -title Plan"
              "> /dev/null".format(message))


def send_alert_if_needed():
    tasks = get_current_and_next_tasks(get_todays_schedule())
    if tasks['current']['name'] is None or tasks['current']['time_left'] is None:
        logging.info('No current task')
        send_mac_notification('No current task')
    elif tasks['current']['time_left'] < TIME_LEFT_THRESHOLD:
        logging.info('Current task: {}'.format(tasks['current']['name']))
        notification_message = 'Current task: {}'.format(tasks['current']['name'])
        notification_message += '\nTime left: {}'.format(tasks['current']['time_left'])
        if tasks['next']['name'] is not None:
            notification_message += '\nNext task: {}'.format(tasks['next']['name'])
        send_mac_notification(notification_message)
    else:
        logging.info('Current task: {}'.format(tasks['current']['name']))


def main():
    while True:
        start_time = time.time()
        send_alert_if_needed()
        end_time = time.time()
        if end_time - start_time > CHECK_INTERVAL_SECS:
            continue
        time.sleep(CHECK_INTERVAL_SECS - (end_time - start_time))


if __name__ == "__main__":
    main()
