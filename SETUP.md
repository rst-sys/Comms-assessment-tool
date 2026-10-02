# Running the app on your own computer

You do not need to know how to code. You need a Mac or Windows computer, about ten minutes, and your Anthropic API key.

## 1. Install Node.js (once)

Node.js is the program that runs the app.

1. Go to https://nodejs.org in your browser.
2. Click the big download button marked **LTS**.
3. Open the downloaded file and click through the installer, accepting the defaults.

## 2. Get the app's files

1. Open the project page on GitHub: https://github.com/rst-sys/Comms-assessment-tool
2. Click the green **Code** button, then **Download ZIP**.
3. Find the ZIP file in your Downloads folder and double-click it to unpack it. You will get a folder called something like `Comms-assessment-tool-main`.

## 3. Start the app

Open that folder and double-click:

- **Start (Mac).command** on a Mac
- **Start (Windows).bat** on Windows

A black text window opens. The first time, it downloads what the app needs (this can take a couple of minutes) and then asks you to paste your API key. Paste it and press Enter. The key is saved in a file called `.env` inside the folder and nowhere else.

Your browser then opens the app by itself. If it does not, open your browser and go to `http://localhost:8787/`.

Leave the black window open while you use the app. Close it when you are done.

## Mac only: "cannot be opened because it is from an unidentified developer"

The first time, right-click **Start (Mac).command**, choose **Open**, and click **Open** again in the warning. After that a double-click works.

## If something goes wrong

- **"Node.js is not installed"**: do step 1, then try again.
- **The app opens but says the evaluation failed**: check that the key you pasted is correct. To enter it again, delete the `.env` file inside the folder and double-click the start file.
- **Nothing happens when you press Evaluate**: an evaluation takes about two minutes. The button says "Evaluating…" while it works.

## What it costs

Each evaluation and each revision sends one request to Anthropic using your key. At the default model, expect well under a dollar per draft.
