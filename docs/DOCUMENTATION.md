# Smart Chair UI

**Project 1: Interface to a Smart Object** · Tyler Beck

- [Open the live app](https://tbeck561.github.io/Project1-UI/)
- [Source code on GitHub](https://github.com/tbeck561/Project1-UI)
- [Watch the demo video](https://youtu.be/6S_KyPfgDek)

**Contents:** [Project](#the-project) · [Design work](#design-work) · [Interface](#the-interface) · [How it was built](#how-it-was-built) · [Future work](#future-work) · [AI documentation](#ai-documentation) · [Demo video](#demo-video)

---

## The project

This project is a mock-up of the interface for a **smart chair**, built with Svelte and JavaScript. The chair senses how a person is sitting and keeps track of how long they have been in it. It reminds them to take breaks, gives gentle posture feedback, and lets them adjust seat heat, recline and lumbar support from a small touch panel on the armrest. There is no real hardware. The sensing is simulated, and the app has two parts that the assignment calls the Device UI and the Testing UI.

- **Device UI** (center): what the chair itself shows. It is an armrest touch screen with a vertical slider beside it. 
- **Testing UI** (right side): controls that pretend to be the person in the chair. You can sit down or stand up, change posture, speed up time, run a whole 9 AM to 5 PM workday, or switch between four pretend users. The left side shows a visual of what the person is doing in the simulation

![The full app with nobody seated](docs/img/01-full-standby.jpg)

*The whole app with nobody in the chair. Device UI is the middle portion center, Testing UI on the right and left*

---

## Design work

### Affordances

A chair is a fixed piece of furniture with several surfaces that people use differently. The seat carries weight and touches the body the most. The backrest supports the spine. The armrests are where hands naturally rest, and the legs and base are structural and rarely touched.

Because the interface cannot live on one flat surface, I split the work up. Sensing happens in the seat and backrest, where the body already is. Visible controls and feedback live on the armrest, where a hand can reach without changing posture. A chair is also used passively most of the time, so the interface only needs attention when the person chooses to check on something or change a setting.

### Smart sensing features

- Pressure sensors in the seat detect whether someone is sitting and estimate posture, including leaning and left/right weight balance.
- A timer tracks the current sitting session, and the chair logs the total sitting time each day.
- The chair can adjust recline and lumbar support, and it has an optional seat heater.
- After a set time, the chair alerts the person to take a break.

### User needs and design requirements

| User need | Design requirement |
|---|---|
| Know how long I have been sitting | Show the current session time and the daily total |
| Be reminded to move or stand up | Give a visible alert after a sitting time the user can configure |
| Better posture without thinking about it | Detect poor posture such as slouching and give gentle feedback |
| A comfortable temperature without fiddling every time | Allow a saved heating preference for each user |
| Adjust things without a separate remote or app | Put controls within reach of the armrest |

### Interview

I asked an interviewee (Soubir) five questions about how long he sits, whether reminders would help or annoy him, whether he thinks about posture, how he would want to set heat, firmness and recline, and where he would not want controls on a chair. His answers shaped the design:

- He usually sits about an hour at a time and his legs feel strange afterward. He thought a reminder would help both his physical and mental health, so I made break reminders a main feature with a length the user can set.
- He never thinks about his posture and nobody points it out, which is why posture feedback is built in and kept quiet.
- He said settings depend on mood and the situation, such as a cool seat one day and a hot seat the next. That is why every setting is quick to change with one slider and is not hidden in a menu.
- He did not want controls anywhere he might hit them by accident or that are hard to reach, so the controls are all on the armrest.

### Sketches

I made 10 sketches for each of my design questions and then picked the ideas that worked best.

![Sketches for posture feedback](docs/img/sketch-posture.jpg)

*Challenge 1: how to show posture feedback without being naggy. Ideas included the backrest adjusting by itself, an app that tells the user, and a color change when posture is poor.*

![Sketches for control placement](docs/img/sketch-controls.jpg)

*Challenge 2: where physical controls go on a chair with no flat surface, such as the armrest tip and the front of the seat.*

![Sketches for showing the chair is active](docs/img/sketch-active.jpg)

*Challenge 3: how to show the chair is actively sensing. Ideas were a light over the head, a sound, and a light under the chair.*

![Vanilla UI sketch with six tiles and a slider](docs/img/sketch-vanilla.jpg)

*The vanilla UI sketch: a grid of six tiles on the left and one vertical slider on the right.*

The vanilla sketch became the final interface almost directly: six tiles and one vertical slider on the armrest panel. I dropped the idea of a light on the chair, because the readings are shown on the touch panel instead.

---

## The interface

### The home screen

The home screen has six tiles. The top row shows live information and opens a screen when tapped. The bottom row controls the slider. When nobody is seated the panel is in standby and the session timer shows dashes.

![Home screen with the six tiles while seated](docs/img/02-home-seated.jpg)

*The home screen while seated. Top row: Session, Posture and Insights. Bottom row: Seat climate, Recline and Lumbar.*

| Control | What it does |
|---|---|
| Session tile | Shows the current sitting timer and total time today. Opens the session screen. |
| Posture tile | Shows the current posture, colored by how good it is, and the percent of today spent upright. Opens the posture screen. |
| Insights tile | Shows today's sitting as a percent of the daily goal. Opens the insights screen. |
| Seat climate, Recline and Lumbar tiles | Tapping one points the slider at that setting. The tile is highlighted so you can see which one is selected. |
| Vertical slider and its three small buttons | Drag to set the chosen setting. The slider can also be used with the arrow keys. The label above it shows the current value, such as "Warm 1" or "107°". |
| Time and timer pill (top right) | Shows the time of day and the running session time. It changes color when posture is poor or a break is due. |

![Slider set to recline](docs/img/08-slider-recline.jpg)

*Choosing the Recline tile points the slider at recline. The label above the slider now reads "Recline 107°".*

### Session screen: timer, break reminder and auto adjust

This screen has the big session timer, a bar that fills up toward the next break, three small statistics (seated today, breaks, longest stretch), a stepper for how often to be reminded to take a break, and the auto adjust controls.

![Session screen](docs/img/03-session.jpg)

*The session screen with auto adjust turned off.*

**Auto adjust** is a switch with a stepper for how many minutes after sitting down it should happen. When it is on, the chair counts the time you have been seated. When it reaches the number you chose, the chair eases the recline, lumbar and seat heat to the settings that are best for that user and also brings you to an upright posture. This happens once for each sitting session. The line under the switch always says what is happening, such as "Adjusts in 1m" or "Adjusted this session".

![Auto adjust switched on with a one minute delay](docs/img/04-session-auto-on.jpg)

*Auto adjust is on and set to one minute. It also lists this user's optimal settings.*

![Chair adjusted banner with an undo button](docs/img/07-auto-done.jpg)

*When the chair has adjusted, a banner says so and offers **Undo**. While it is moving the banner offers **Stop**.*

The person is always in control. Touching any control while the chair is moving stops the adjustment, **Stop** ends it where it is, and **Undo** puts the settings and posture back to how they were.

![Posture screen with the chair adjusted banner](docs/img/06-auto-moving.jpg)

*The chair after auto adjust fired while the person was slouching. The posture is now Upright and the banner says so.*

### Alerts and feedback

The chair gives feedback in two different ways, so that it is not annoying.

![Quiet posture note after slouching for a while](docs/img/09-nudge.jpg)

***Posture nudge.** Slouching for about four minutes brings up one quiet message. It then stays quiet for 20 minutes, so it never nags.*

![Break alert banner with a snooze button](docs/img/10-break-alert.jpg)

***Break alert.** After the chosen sitting time (45 minutes by default) an amber banner says "Time to move" with a Snooze button.*

### Posture screen: live sensors and history

The seat and backrest sensors are recorded here on the touch panel. The screen has a card showing the current posture, how long it has been held, and the percent of today spent upright, plus two views.

![Live view while slouching](docs/img/05-posture-live-slouch.jpg)

***Live.** The backrest strip shows which spots touch your back, and the seat grid shows where your weight is, with the left/right split.*

![History view with heat maps and timeline](docs/img/13-posture-history.jpg)

***History.** Heat maps of the backrest and seat for the day, a sentence about where your weight has been, a posture timeline, and a log of recent movement.*

The heat maps add up how long each spot has been pressed, so brighter or redder means more time. The timeline shows each stretch of time in one posture as a colored block, with the posture names written next to the colors (so it is not just color). The "Recording" button pauses and resumes recording.

### Insights screen

The insights screen has a ring for today's goal, the last seven days as bars with a dashed goal line, and a bar showing how today was split between postures. The Testing UI can load four pretend users, who each have their own goal, history, settings and optimal settings. Loading a different user changes everything the interface shows.

![Insights screen for Alex](docs/img/11-insights.jpg)

*Insights for the week.*


### The Testing UI

![Testing panel](docs/img/15-testing-panel.jpg)

| Control | What it does |
|---|---|
| Sit down / Stand up | Pretends someone sits in the chair or leaves it |
| Posture buttons | Upright, slouching, leaning forward, leaning left or leaning right |
| Time speed | ×1, ×60 or ×600, so you do not have to wait for a real hour |
| Run 9 AM – 5 PM | Plays a scripted workday with sitting, posture changes and breaks at fast speed |
| Load a user | Switches between Alex, Maya, Sam and Jordan |
| Where the UI lives | A small drawing showing that everything is on the armrest touch panel |

![The workday simulation running](docs/img/12-workday-running.jpg)

*The workday simulation running. The history builds up as the day goes on.*

---

## How it was built

### Libraries and tools

- **Svelte**, using its reactive runes (`$state`, `$derived`, `$props`)
- **Vite** for the dev server and the production build
- Plain JavaScript, HTML and CSS. There are no UI libraries. The icons, charts, heat maps and slider are all drawn by hand with SVG and CSS.
- **GitHub Actions** builds the app and publishes it to GitHub Pages every time I push to `main`


### Design concepts from class

- **Affordance and signifiers:** tiles look raised and pressable, and the selected tile is highlighted so you know the slider is pointed at it.
- **Mapping:** the slider's top is "more" (warm, back, firm) and its bottom is "less", with labels at both ends.
- **Feedback:** the slider label, the tile values and the chair drawing all update immediately when something changes.
- **Simplicity:** one slider controls three settings, and each screen answers one question.
- **Color:** a dark base with one accent. Amber means attention and green means good, and posture names are always written out, so color is never the only signal.

---

## Future work

- **Sound for the break alert.** The alert is visual only. My sketches included a sound to show that the chair is active, and the interviewee said he would find reminders helpful, so an optional soft tone is the next thing I would add.
- **Saving settings.** Nothing is saved when the page is reloaded. I would store each user's settings and history in the browser.
- **Learning the optimal settings.** Right now each user's optimal settings are fixed numbers. A real chair could learn them from what the person adjusts to most often.
- **Real hardware.** The sensing is simulated. The next step would be connecting real pressure sensors.

---

## AI documentation

**What I did**

- The design work: the affordance analysis, the user needs and requirements, the interview, the 10 plus 10 sketches, and the vanilla UI sketch.
- Choosing the smart object and deciding what the interface should do, using my design document and the class slides.
- Deciding the work such as simplifying the interface, restyling it to look like an app, removing buttons and links, adding the timed auto adjust, moving the sensor readouts onto the touch panel and adding the history, and fixing a freeze that happened after the simulation.
- Testing the app, setting up the GitHub repository and publishing it with GitHub Pages.

**What Claude did**

- Wrote the framework Svelte and JavaScript code for the app as well as the simulation and chair visuals.
- Helped redesignfeatures catered to my orginal ideas and added the features I asked for, and fixed the bugs I reported.
- Wrote many code comments to track changes.
- Explained errors I ran into while setting up and deploying.




