import threading
import time
import subprocess
import asyncio

import psutil

from utils.singleton import Singleton
from utils.sound_manager import SoundManager


class PlayerManager(object, metaclass=Singleton):
    """
    Class to play music with mpg123
    """
    MPLAYER_EXEC_PATH = "mpg123"

    def threaded_start(self, url):
        """
        The player manager need to be executed in a thread.
        Use this method to create a thread if the called is not already a thread like the scheduler manager
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        main_thread = threading.Thread(target=self.async_start, args=[loop, url, False])
        main_thread.start()

    def async_start(self, loop, url, fade=True, auto_stop_minutes=0, backup_file_path=None):
        seconds = auto_stop_minutes * 60    # need to convert in seconds
        loop.run_until_complete(self.main_loop(url, seconds, backup_file_path, fade))

    async def main_loop(self, url, auto_stop_seconds, backup_file_path, fade, second_to_wait_before_check=35):
        print(f"started at {time.strftime('%X')}")
        # Create an Event object
        event = asyncio.Event()

        start_player_task = asyncio.create_task(
            self.start_player_task(url, fade))
        check_player_alive_task = asyncio.create_task(
            self.check_player_task(event, second_to_wait_before_check, backup_file_path))
        auto_stop_task = asyncio.create_task(
            self.auto_kill_player_task(event, seconds=auto_stop_seconds))

        await start_player_task
        await check_player_alive_task
        await auto_stop_task

        print(f"finished at {time.strftime('%X')}")

    async def start_player_task(self, url, fade=True):
        print("starting player with URL {}".format(url))
        if "spotify" in url:
            url = url.split("//")[-1]
            media, id = url.split("/")[1::]
            command = 'spt p -u "spotify:{0}:{1}" -d "radiogaga" -r'.format(media, id.split("?")[0])
        else:
            command = "mpg123 {}".format(url)
        if fade:
            fade_in_task = asyncio.create_task(self.fade_in())
            await asyncio.gather(fade_in_task, self.run_command(command))
        else:
            await self.run_command(command)

        print("Player stopped")

    async def fade_in(self):
        init_volume = SoundManager.get_volume()
        print("Initial volume is {}".format(SoundManager.get_volume()))
        SoundManager.set_volume(0)
        print("Setting volume to {}".format(SoundManager.get_volume()))
        for i in range(10*init_volume):
            SoundManager.set_volume(0.1*i)
            print("Setting volume to {}".format(SoundManager.get_volume()))
            await asyncio.sleep(0.2)
        print("Fading in complete")
    
    async def check_player_task(self, event, seconds, backup_file_path):
        if backup_file_path is not None:
            print("Wait '{}' seconds before checking player process...".format(seconds))
            await asyncio.sleep(seconds)
            if not event.is_set():
                print("Checking if player process is alive")
                if self.is_started():
                    print("Player is alive")
                else:
                    print("Player not alive")
                    event.set()  # notify auto kill method to not execute the stop
                    await self.run_backup_file(backup_file_path)
                    return False
            else:
                print("Player already stopped. Do not need to check")
        return True

    async def auto_kill_player_task(self, event, seconds=0):
        """
        return true when the player has been stopped
        """
        if seconds > 0:
            print("Wait '{}' seconds before auto stopping player...".format(seconds))
            await asyncio.sleep(seconds)
            if not event.is_set():
                print("Timer exceeded. Killing player")
                command = "killall mpg123"
                await self.run_command(command)
                spt_state = subprocess.Popen(["spt", "pb", "-s"], stdout=subprocess.PIPE).communicate()[0].decode()
                if len(spt_state) != 0 and spt_state[0] == '▶':
                    command = "spt pb -t"
                    await self.run_command(command)
                print("Player killed")
                event.set()
                return True
            else:
                print("Player already stopped. Do not run auto stop")
        return False

    async def run_backup_file(self, file_path):
        print("Running backup MP3 file '{file_path}'")
        command = "mpg123 {}".format(file_path)
        await self.run_command(command)

    async def run_command(self, command):
        """
        Run command in subprocess.

        Example from:
            http://asyncio.readthedocs.io/en/latest/subprocess.html
        """
        # Create subprocess
        process = await asyncio.create_subprocess_shell(
            command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )

        # Status
        print("Started: '%s', pid: '%s'" % (command, process.pid), flush=True)

        # Wait for the subprocess to finish
        stdout, stderr = await process.communicate()

        # Progress
        if process.returncode == 0:
            print(
                "Done: %s, pid=%s, result: %s"
                % (command, process.pid, stdout.decode().strip()),
                flush=True,
            )
        else:
            print(
                "Failed: %s, pid=%s, result: %s"
                % (command, process.pid, stderr.decode().strip()),
                flush=True,
            )

        # Result
        result = stdout.decode().strip()

        # Return stdout and return code
        return result, process.returncode

    @staticmethod
    def stop():
        """
        Kill mpg123 process
        """
        p = subprocess.Popen("killall mpg123", shell=True)
        p.communicate()

        spt_state = subprocess.Popen(["spt", "pb", "-s"], stdout=subprocess.PIPE).communicate()[0].decode()
        if len(spt_state) != 0 and spt_state[0] == '▶':
            p = subprocess.Popen(["spt", "pb", "-t"])
            p.communicate()

    @staticmethod
    def is_started():
        spt_state = subprocess.Popen(["spt", "pb", "-s"], stdout=subprocess.PIPE).communicate()[0].decode()
        if len(spt_state) != 0 and spt_state[0] == '▶':
            return True
        process_name = "mpg123"
        # Iterate over the all the running process
        for proc in psutil.process_iter():
            try:
                # Check if process name contains the given name string.
                if process_name.lower() in proc.name().lower():
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        return False
