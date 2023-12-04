// ==UserScript==
// @name          ChatGPT Userscript
// @description   A Greasemonkey template to start using chatgpt.js like a boss
// @author        chatgpt.js
// @namespace     https://chatgpt.js.org
// @version       2023.11.28
// @license       MIT
// @match         https://chat.openai.com/*
// @icon          https://raw.githubusercontent.com/kudoai/chatgpt.js-greasemonkey-starter/main/media/images/icons/robot/icon48.png
// @icon64        https://raw.githubusercontent.com/kudoai/chatgpt.js-greasemonkey-starter/main/media/images/icons/robot/icon64.png
// @require       https://cdn.jsdelivr.net/gh/kudoai/chatgpt.js@91ddac7665eed132c3ac63b35db6b8fffffbc893/dist/chatgpt-2.6.0.min.js
// @grant         GM_getValue
// @grant         GM_setValue
// @noframes
// @homepageURL   https://github.com/kudoai/chatgpt.js-greasemonkey-starter
// @supportURL    https://github.com/kudoai/chatgpt.js-greasemonkey-starter/issues
// ==/UserScript==

// NOTE: This script relies on the powerful chatgpt.js library @ https://chatgpt.js.org (c) 2023 KudoAI & contributors under the MIT license

(async () => {
  const prompts = [];
  let promptPointer = 0;

  const say = (x) => {
    const msg = new SpeechSynthesisUtterance();
    msg.text = x;
    window.speechSynthesis.speak(msg);
  };
  // Init config
  const config = { prefix: "chatgptScript" };
  loadSetting("skipAlert");

  // Print chatgpt.js methods
  await chatgpt.isLoaded();

  say("chatgpt plus is loaded!");

  const continueObserver = new MutationObserver((mutations) => {
    const sendButton = chatgpt.getSendButton();
    if (sendButton && sendButton.disabled) {
      chatgpt.getLastPrompt().then((prompt) => {
        if (prompt) {
          updatePrompts(prompt);
        }
      });
    }
  });
  continueObserver.observe(document.querySelector("main"), {
    attributes: true,
    subtree: true
  });

  // if prompt.trim() is not in prompts (case insensitive), add it
  // if prompt.trim() is in prompts (case insensitive), move it to the end
  function updatePrompts(prompt) {
    const index = prompts.findIndex(
      (p) => p.toLowerCase().trim() === prompt.toLowerCase().trim()
    );
    if (index === -1) {
      prompts.push(prompt);
    } else {
      prompts.push(prompts.splice(index, 1)[0]);
    }
  }

  // add a listener to the document for keydown events
  // alt-up to cycle prompts
  // alt-down to cycle prompts in reverse
  document.addEventListener("keydown", (event) => {
    if (event.altKey) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        cyclePrompts();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        cyclePrompts(true);
      }
    } else {
      promptPointer = 0;
    }
  });

  // cycle prompts
  function cyclePrompts(forward = false) {
    const increment = forward ? 1 : -1;
    promptPointer =
      (promptPointer + increment + prompts.length) % prompts.length;
    const prompt = prompts[promptPointer];
    setPrompt(prompt);
  }

  // complete this function to set the prompt in the chat box
  function setPrompt(prompt) {
    const chatInputBox = document.querySelector("#prompt-textarea");
    if (chatInputBox) {
      chatInputBox.value = prompt;
      chatInputBox.dispatchEvent(new Event("input", { bubbles: true })); // Trigger input event to reflect the change
    }
  }

  // Show alert
  if (!config.skipAlert) {
    chatgpt.alert(
      "≫ ChatGPT script loaded! 🚀", // title
      "Success! Press Ctrl+Shift+" + // msg
        (navigator.userAgent.indexOf("Firefox") > -1 ? "K" : "J") +
        " to view all chatgpt.js functions.",
      function getHelp() {
        // button
        window.open(
          "https://github.kudoai.com/chatgpt.js-greasemonkey-starter/issues",
          "_blank",
          "noopener"
        );
      },
      function dontShowAgain() {
        // checkbox
        saveSetting("skipAlert", !config.skipAlert);
      }
    );
  }

  // Define HELPER functions
  function loadSetting(...keys) {
    keys.forEach((key) => {
      config[key] = GM_getValue(config.prefix + "_" + key, false);
    });
  }
  function saveSetting(key, value) {
    GM_setValue(config.prefix + "_" + key, value);
    config[key] = value;
  }
})();
