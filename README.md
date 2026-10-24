# HealthyBite Board

A Trello-style board made for the HealthyBite team (7 students, 7 weeks, one 3-hour session a week).
Plain HTML, CSS and JS: no build step, no install.

## How a week works
Open **This week** at every session and follow the 6 steps:

| Step | What the board shows |
|---|---|
| **Before** | Who does what this week and last week's handoff. Press **Start the session**. |
| **Recap & handoff** (15 min) | Last week's handoff and the latest between-sessions work. |
| **Lesson** (30 min) | The lesson, and a box for the team's notes. |
| **Pair work** (1h45) | Your own tasks first, what to hand in this week (with **Submit**), then the other pairs' tasks. |
| **Presentation** (30 min) | The deliverables to review (**Review** button for the Coordinator) and the "Done by the end" checklist. |
| **After** | The handoff note for next week's team, the between-sessions log, and a preview of next week and your next role. |

The timer is shared by everyone and moves the guide to the next step by itself. **Next step** skips ahead. Click any step
to look at it, then **Back to the current step**.

## Pages
| Page | What it does |
|---|---|
| **This week** | The guide above. |
| **All weeks** | The 7 weeks at a glance with their progress. Click one to open it: tasks by role (tick, add with "New task, then Enter", delete), checklist, deliverables, and **Edit week plan** (focus, lesson, checklist, expected deliverables). |
| **Tasks** | To do / Doing / Review / Done for all tasks, with filters, search, drag and drop, and quick add. |
| **Deliverables** | Every week's deliverables, filterable by week and status. |
| **More** | Posts (tracking and baseline vs. current), Sellers (pitch pipeline), Budget (DZD), Risks, Settings (names, week 1 date, sharing, backup, reset). |

**How it works** (bottom of the sidebar) replays the 4-slide welcome tour shown the first time someone opens the board.

**Who are you?** After the tour, the board asks for your name (saved on that laptop only). It signs your submissions,
reviews and comments, and the guide shows your own role and tasks first. Change it by clicking your name in the sidebar.

**Tasks and subtasks.** Open any task to change its title, week, role, person, due date and description, add subtasks
(type and press Enter, tick them as you go), and leave comments.

**Deliverables.** Click a deliverable, add links (Canva, Google Drive, Instagram, the website…), up to 6 photos and a note,
then **Submit**. Photos are shrunk automatically and stored in Firebase. Put PDFs and videos in Google Drive and paste the
link. The week's Coordinator opens it and clicks **Approve** or **Ask for changes** with a comment. The team fixes it and
uses **Edit & resubmit**. Every step is kept in the history.

**No health claims.** A card with the type *Content (caption)* cannot go to Done until all five review checks are ticked and the
caption contains none of the flagged words (cure, détox, diabète, تخسيس, …). Edit the list in `data.js` (`CLAIM_WORDS`).

**Roles rotate on their own.** Put the 7 names in Settings in any order. Each week everyone moves one seat, so over the
7 weeks each person is Coordinator once and works in every pair. The table in Settings shows the whole rotation.

Languages: English, French and Arabic (right-to-left), switched in the top bar (EN · FR · ع).

## First steps
1. Open **More → Settings**: type the 7 names, and set the date of the week 1 session (the current week then follows the calendar).
2. Turn on live sharing (below) so all 7 of you see the same board.
3. Put it online (below) and send the link on the team WhatsApp group.

## Turn on live sharing (free Firebase, about 10 minutes)
Without this, the board saves only in the browser that is using it.

1. Go to <https://console.firebase.google.com>, sign in with a Google account, **Add project**, name it `healthybite-board`
   (Google Analytics: off).
2. In the project: **Build → Firestore Database → Create database**, pick a location close to Algeria (for example `eur3` or
   `europe-west1`), and choose **production mode**.
3. Open the **Rules** tab, paste the content of `firestore.rules`, replace `healthybite-CHANGE-ME` with a team space name that is
   hard to guess (for example `healthybite-7k2q9x`), and **Publish**.
4. **Project settings (⚙) → General → Your apps → Web (</>)**, give it a nickname, register it (no hosting needed).
   Firebase shows a `firebaseConfig` block.
5. Open `config.js` and fill it in:
   ```js
   window.HB_CONFIG = {
     firebase: {
       apiKey: "…",
       authDomain: "…",
       projectId: "…",
       storageBucket: "…",
       messagingSenderId: "…",
       appId: "…"
     },
     team: "healthybite-7k2q9x"   // same name as in the rules
   };
   ```
6. Reload the board. The badge in the top bar turns green: **Live · shared with the team**. The 7-week plan is created in
   Firebase the first time.

To try it before editing files, you can also paste the `firebaseConfig` block in **Settings → Live sharing** (that only
affects your own browser).

About security: the Firebase web config is not a secret (it is in every Firebase website). What protects the data is the rule:
only the team space name you chose can be read or written, so keep that name inside the team. The free Spark plan is far more
than 7 people need.

## Put it online (GitHub Pages)
1. Create a new public repository, for example `healthybite-board`, on <https://github.com/aminabouzenadapro>.
2. Upload every file of this folder (`index.html`, `styles.css`, the `.js` files).
3. **Settings → Pages → Branch: main / root → Save.**
4. After a minute the board is at `https://aminabouzenadapro.github.io/healthybite-board/`. Share that link.

## Open it on one computer only
Double-click `index.html`, or run a small server in this folder:
```
python -m http.server 8010
```
then open <http://localhost:8010>.

## Backup
**Settings → Backup → Export file** downloads everything as a `.json` file. **Import file** puts it back
(it replaces the current board). **Reset to the HealthyBite plan** starts again from the original plan.

## Change the plan
Most changes are done in the app: **Edit week plan** on each week page (focus, lesson, checklist, deliverables), and adding,
editing or deleting tasks directly. The starting plan (texts in English, French and Arabic), the agenda timings, the review
checklist and the starting risks are in `data.js`. Edited texts are kept as typed, in one language.

## Files
| File | What it is |
|---|---|
| `data.js` | The 7-week plan, deliverables, risks and all interface texts (EN/FR/AR). |
| `config.js` | Firebase settings and team space name. |
| `store.js` | Saving: Firebase (shared) or this browser only. |
| `ui.js`, `views.js`, `guide.js`, `modals.js`, `app.js` | The app: helpers, pages, the weekly guide, dialogs, navigation. |
| `styles.css` | Design. Colors are at the top. |
