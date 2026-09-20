# Putting the tool on the internet for your testers

This turns the tool into a normal web address you can send to people. They click
the link, type a password once, and use it. They do not install anything and do
not need a Claude account.

**You pay for every review anyone runs.** That is the whole reason for the
password and the limits below. Read the money section before you start.

---

## Before you begin: five things only you can do

### 1. Replace your Anthropic key

Your old key was printed into a log by mistake and should be treated as no
longer secret. Before the tool goes on the internet, replace it.

1. Go to https://console.anthropic.com and sign in.
2. Open **API keys**.
3. Click **Create key**. Give it a name like `trust-assessment-live`.
4. Copy the new key somewhere safe. You will paste it in step 4 below. You
   cannot see it again after you close the box.
5. Delete the old key from the same page.

### 2. Set a spending limit

This is your real protection. Everything else can fail; this cannot.

1. In the same console, open **Billing** (sometimes **Plans & billing**).
2. Find the spending limit or budget setting.
3. Set a monthly figure you would be relaxed about losing. For a first round of
   testing, something like £50 or $50 is sensible.

Do not skip this. The daily limits inside the app reset if the server restarts;
the limit on your account does not.

### 3. Choose a password for your testers

Any phrase you like, as long as it is not guessable. Three unrelated words work
well, for example `copper-lantern-marsh`. Write it down. You will paste it in
step 4 and then send it to your testers.

### 4. Create a hosting account

Render is the simplest. https://render.com — sign up with your GitHub account
so it can see the code.

### 5. Decide what you tell your testers about privacy

The tool stores nothing, and that stays true. But be straight with them:

- Their draft is sent to Anthropic to be analysed, then discarded.
- The hosting company handles the traffic.
- Nothing is removed from their text before it is sent.
- So: no legally privileged material, no unreleased financial information, no
  personal data about identifiable people.

---

## Putting it online

1. Sign in to Render and click **New** → **Blueprint**. (Not "Web Service" —
   Blueprint is the one that reads the `render.yaml` file in this project and
   fills in the settings for you.)
2. Choose this repository, and check the **branch** it offers is the one that
   holds the app.
3. Render asks you for the two secrets it does not have:
   - **ACR_API_KEY** — the new key from step 1.
   - **ACR_ACCESS_PASSWORD** — the password from step 3.
4. Click **Create Web Service** and wait. The first build takes a few minutes.
5. When it finishes, Render shows an address like
   `https://trust-assessment-assistant.onrender.com`. That is your link.

## Check it before you send it to anyone

Do all four of these yourself first.

1. Open the link in a **private or incognito window**. You should see the
   password screen, not the tool.
2. Type the wrong password. It should refuse you.
3. Type the right password. The tool should open.
4. **Run one full review.** This is the important one: a review takes about two
   minutes, and some hosts cut off requests that take that long. If the review
   comes back, you are fine. If it fails partway with a connection error, tell
   me and I will change how it works.

Only then send the link and the password to your testers.

---

## What the limits do

| Setting | What it means |
| --- | --- |
| `ACR_DAILY_LIMIT_PER_VISITOR` | How many reviews one person can run in a day. Starts at 10. |
| `ACR_DAILY_LIMIT_TOTAL` | How many reviews everyone together can run in a day. Starts at 60. |

Change either one in Render's **Environment** tab. The service restarts and
picks up the new number.

When someone hits a limit, they see a plain message telling them to try
tomorrow. Nothing breaks.

**The honest limitation:** these counters live in the server's memory. If the
service restarts, they go back to zero. That is why the spending limit on your
Anthropic account matters more than these do.

## Roughly what it costs

Each review makes Claude produce around eight thousand words of analysis behind
the scenes, most of which you never see. Expect **somewhere around a dollar per
review**. Check Anthropic's current pricing page to confirm, because prices
change and this is an estimate from the size of the calls, not a quoted price.

Five testers running ten reviews each is in the region of fifty dollars.

## If something goes wrong

- **"Enter the password to use this tool" when you have already typed it** —
  your browser is refusing the small file that remembers you are signed in.
  Turn off strict privacy blocking for the site, or use a different browser.
- **The page loads but every review fails** — check `ACR_API_KEY` in Render's
  Environment tab. If the key is wrong or has been deleted, every review fails
  the same way.
- **The first visit each morning is very slow** — you are on the free plan and
  the service went to sleep. Upgrade to `starter` in Render's settings.
- **A review fails after about a minute with a connection error** — the host is
  cutting off the long request. Tell me; this needs a change to the code, not a
  setting.

## Turning it off

In Render, open the service, then **Settings** → **Suspend**. The link stops
working and you stop being charged for the hosting. Suspending does not delete
anything; you can resume it later.
