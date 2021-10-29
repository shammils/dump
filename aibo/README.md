もおおおおおおおおおおお!

TODO:
  - The ability to talk to aibo globally, no matter which class we are in
  - explanations/descriptions on classes. explanations will be audible of course
  - write to log file
    - When selecting a menu item, show/play description/explanation
  - We got audio in a format that works with google cloud!
    - Record audio using termux's built in tool(that doesnt work with google
      cloud) with command:
      $ termux-microphone-record -f <filename>.amrwb -e amr_wb

      The extension is .amrwb which specifically for ffmpeg to identify with.
      You can see the supported extensions with command
      $ ffmpeg -formats
      command
      $ ffmpeg -codecs
      might be of some use... maybe
    - Convert the output of the above process with ffmpeg:
      $ ffmpeg -i <filename>.amrwb <filename>.wav

      This command will create a Signed PCM, 1 channel at 16 bit, bit rate 256K,
      sample rate 16K file in a wav container.
    - Upload the fucking wav file to google cloud as `LINEAR16`, 16K sample rate
    - ???
    - profit

    - recording audio on my ubuntu machine isnt working, so... work around it? I
      fixed it at some point but I cant remember how I did it. hopefully I wrote
      notes.

  - Time to start making progress in Yonde again!

  - Design an interface that doesnt exactly exist yet. features:
    - no idea
    - text input conversation mode, like texting
      - should be able to toggle aibo audio
      - save state of course
    - Testing mode
    - Basic lang 2 lang translation support
      - more than japanese and english? why not?
    - Command mode
    - Termux Job Scheduler https://wiki.termux.com/wiki/Termux-job-scheduler
      - reminders for benkyou
      - maybe even incorporate calendar events
      - we probably dont need it if aibo is running. we can probably get around
        it by running cron jobs. if cron job executes while aibo is running, do
        nothing. if no node process is running, check events and notify if something
        comes up

need to start working on yonde big time. yonde should be referenced outside of
the project for some reason.
yonde's definitions file will not be checked in publicly, but we will check in a
copy that is an example of its full capabilities which should be used to power the
tests.
What kind of games can we build in cmd format?
text input mode should look somewhat like text messages. example:

      | this is a phone
      v
_-------------------_
|                   |
|                   |
|                   |
|                   |
|             Hello |
| whats up          |
|                   |
| > what time is it |
|  *      *     *   | <- the asterisks are the phone's navigation buttons?
-___________________-

we need a way to toggle audio for aibo in text mode
