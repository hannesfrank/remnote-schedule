from unittest import TestCase


class Test(TestCase):
    def test_send_mac_notification(self):
        from daily_schedule_notifier import send_mac_notification
        send_mac_notification("test")


class Test(TestCase):
    def test_main(self):
        from daily_schedule_notifier import main
        main()
