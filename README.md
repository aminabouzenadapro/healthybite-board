# HealthyBite Board

A Trello-style board made for the HealthyBite team (7 students, 7 weeks, one 3-hour session a week).
Plain HTML, CSS and JS: no build step, no install.

## What's inside
The left sidebar has the main pages, the 7 weeks (with a progress ring each) and the tracking sheets. On a phone it
opens with the ☰ button.

| Page | What it does |
|---|---|
| **Dashboard** | This week's focus and lesson, your role and your open tasks, project-wide progress (tasks done, deliverables approved, sellers pitched, posts logged), a 7-week progress chart, and the deliverables waiting for review. |
| **Week 1–7** | Header with phase, date, focus and lesson. Tasks grouped by role with the people holding each role: tick to finish, type in "New task, then Enter" to add, bin icon to delete, click a task to open it. Then the "Done by the end" checklist and the deliverables to submit. **Edit week plan** changes the focus, lesson, checklist and expected deliverables. |
| **Board** | To do / Doing / Review / Done for all tasks. Filter by week, role or person, search from the top bar, drag cards between columns, and add a card at the bottom of any column. Cards show their subtask progress. |
| **Deliverables** | Every week's deliverables, filterable by week and status (Not submitted, Waiting for review, Needs changes, Approved). |
| **Session** | Shared 3-hour agenda timer (15 min recap, 30 min lesson, 1h45 pair work, 30 min presentation), handoff notes for this week, last week's notes for the recap, and the between-sessions log for the Client & data pair. |
| **Posts** | Post tracking (date, account, post, format, reach, likes, saves, messages) and baseline vs. current numbers for each client. |
| **Sellers** | Pitch pipeline: To contact, Contacted, Replied, Meeting, Signed, Not now. |
| **Budget** | Spending in DZD against a limit. |
| **Risks** | Risk list, pre-filled with the usual ones. |
| **Settings** | Member names, week 1 date, live sharing, backup and reset. |

**Who are you?** The first time someone opens the board it asks for their name (saved on that phone or laptop only).
Their name signs submissions, reviews and comments, and the Dashboard shows their own role and tasks. Change it by clicking
the name at the top of the sidebar.

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

Languages: English, French and Arabic (right-to-left), switched in the top bar.

## First steps
1. Open **Settings**: type the 7 names, and set the date of the week 1 session (the current week then follows the calendar).
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
| `ui.js`, `views.js`, `modals.js`, `app.js` | The app: helpers, pages, dialogs, navigation. |
| `styles.css` | Design. Colors are at the top. |
