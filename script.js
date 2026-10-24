// Replace these three placeholders with the values shown in your EmailJS dashboard.
// The Public Key is meant for browser use; never put a private key or secret here.
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

/*
EmailJS setup:
1. In emailjs.com, add an Email Service and connect your Gmail account by following
   EmailJS's authorization flow. Do not put your Gmail password in this project.
2. Create an Email Template. Use {{from_name}}, {{from_email}}, {{subject}}, and
   {{message}} in its content. Set Reply-To to {{from_email}} so you can reply to
   the sender. The template's recipient is the inbox where you want messages sent.
3. Copy the service ID, template ID, and browser Public Key into the constants above.
*/

const form = document.querySelector("#contact-form");
const submitButton = document.querySelector("#submit-button");
const statusMessage = document.querySelector("#form-status");
const fields = ["name", "email", "subject", "message"];

function setStatus(message, state) {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

function clearFieldError(fieldName) {
  const input = document.querySelector(`#${fieldName}`);
  const error = document.querySelector(`#${fieldName}-error`);

  input.removeAttribute("aria-invalid");
  error.textContent = "";
}

function validateForm() {
  let firstInvalidField = null;

  fields.forEach((fieldName) => {
    const input = document.querySelector(`#${fieldName}`);
    const error = document.querySelector(`#${fieldName}-error`);
    const value = input.value.trim();
    let message = "";

    if (!value) {
      const fieldLabel = {
        name: "full name",
        email: "email address",
        subject: "subject",
        message: "message"
      }[fieldName];
      message = `Please enter your ${fieldLabel}.`;
    } else if (fieldName === "email" && !input.validity.valid) {
      message = "Please enter a valid email address.";
    }

    if (message) {
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
      firstInvalidField ||= input;
    } else {
      clearFieldError(fieldName);
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
    return false;
  }

  return true;
}

fields.forEach((fieldName) => {
  document.querySelector(`#${fieldName}`).addEventListener("input", () => {
    clearFieldError(fieldName);
    setStatus("", "");
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("", "");

  if (!validateForm()) {
    return;
  }

  const credentialsAreConfigured =
    EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
    EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID";

  if (!credentialsAreConfigured) {
    setStatus(
      "EmailJS is not configured yet. Add your Public Key, Service ID, and Template ID in script.js.",
      "error"
    );
    return;
  }

  if (!window.emailjs) {
    setStatus("EmailJS could not be loaded. Check your internet connection and try again.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Sending...";

  try {
    // These parameter names must match the variables in your EmailJS template.
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: form.elements.from_name.value.trim(),
      from_email: form.elements.from_email.value.trim(),
      subject: form.elements.subject.value.trim(),
      message: form.elements.message.value.trim()
    }, {
      publicKey: EMAILJS_PUBLIC_KEY
    });

    form.reset();
    setStatus("Your message was sent successfully. Thank you for getting in touch!", "success");
  } catch (error) {
    console.error("EmailJS send failed:", error);
    setStatus("We couldn't send your message. Please check your EmailJS setup and try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Send message";
  }
});
