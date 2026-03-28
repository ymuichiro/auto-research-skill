const COPY_RESET_DELAY_MS = 1600;

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";

  document.body.append(textarea);
  textarea.focus();
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("execCommand copy failed");
    }
  } finally {
    textarea.remove();
  }
}

async function writeClipboardText(text) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  fallbackCopyText(text);
}

function setStatus(statusNode, message) {
  if (!statusNode) {
    return;
  }

  statusNode.textContent = "";

  window.requestAnimationFrame(() => {
    statusNode.textContent = message;
  });
}

function composeCopyPayload(button) {
  return `${button.dataset.shareTitle ?? ""}\n${button.dataset.shareUrl ?? ""}`.trim();
}

function resetCopyButton(button) {
  button.dataset.state = "idle";
  button.setAttribute("aria-label", button.dataset.copyLabelDefault ?? "");
  if (button._copyResetTimer) {
    window.clearTimeout(button._copyResetTimer);
    button._copyResetTimer = 0;
  }
}

async function handleNativeShare(button) {
  if (typeof navigator.share !== "function") {
    return;
  }

  const payload = {
    title: button.dataset.shareTitle ?? "",
    text: button.dataset.shareText ?? "",
    url: button.dataset.shareUrl ?? ""
  };

  try {
    await navigator.share(payload);
  } catch (error) {
    if (error?.name !== "AbortError") {
      const statusNode = button.parentElement?.querySelector("[data-share-status]");
      setStatus(statusNode, button.dataset.copyStatusError ?? "");
    }
  }
}

async function handleCopy(button) {
  const statusNode = button.parentElement?.querySelector("[data-share-status]");

  try {
    await writeClipboardText(composeCopyPayload(button));
    resetCopyButton(button);
    button.dataset.state = "success";
    button.setAttribute("aria-label", button.dataset.copyLabelSuccess ?? button.dataset.copyLabelDefault ?? "");
    setStatus(statusNode, button.dataset.copyStatusSuccess ?? "");
    button._copyResetTimer = window.setTimeout(() => {
      resetCopyButton(button);
    }, COPY_RESET_DELAY_MS);
  } catch {
    resetCopyButton(button);
    setStatus(statusNode, button.dataset.copyStatusError ?? "");
  }
}

function initArticleShare() {
  document.querySelectorAll("[data-native-share]").forEach((button) => {
    if (typeof navigator.share === "function") {
      button.hidden = false;
    }
  });

  document.addEventListener("click", (event) => {
    const shareButton = event.target.closest("[data-native-share]");
    if (shareButton) {
      event.preventDefault();
      void handleNativeShare(shareButton);
      return;
    }

    const copyButton = event.target.closest("[data-copy-share]");
    if (copyButton) {
      event.preventDefault();
      void handleCopy(copyButton);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArticleShare, { once: true });
} else {
  initArticleShare();
}
