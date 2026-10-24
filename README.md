# HealthyBite Board

A Trello-style board made for the HealthyBite team (7 students, 7 weeks, one 3-hour session a week).
Plain HTML, CSS and JS: no build step, no install.

## What's inside
| Tab | What it does |
|---|---|
| **This week** | Phase, focus and lesson of the week, who holds which role, tasks per role, the "Done by the end" checklist. Click a week number to look at another week. |
| **Board** | To do / Doing / Review / Done. The whole 7-week plan is already loaded as cards. Filter by week, role or person. Drag cards between columns, or open a card and change its status. |
| **Session** | Shared 3-hour agenda timer (15 min recap, 30 min lesson, 1h45 pair work, 30 min presentation), handoff notes for this week, last week's notes for the recap, and the between-sessions log for the Client & data pair. |
| **Posts** | Post tracking (date, account, post, format, reach, likes, saves, messages) and baseline vs. current numbers for each client. |
| **Sellers** | Pitch pipeline: To contact, Contacted, Replied, Meeting, Signed, Not now. |
| **Budget** | Spending in DZD against a limit. |
| **Risks** | Risk list, pre-filled with the usual ones. |
| **Settings** | Member names, week 1 date, live sharing, backup and reset. |

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
2. Upload every file of this folder (`index.html`, `styles.css`, `app.js`, `data.js`, `store.js`, `config.js`).
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
Everything about the 7 weeks (focus, lesson, tasks per role, Done checklist), the agenda timings, the review checklist and the
starting risks is in `data.js`, in English, French and Arabic. Cards are created from it the first time the board opens.
Changes in `data.js` after that only show on cards if you use **Reset to the HealthyBite plan**.
