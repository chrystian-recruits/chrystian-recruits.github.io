/**
 * Shared apply-form handler.
 * After you deploy apps_script/Code.gs as a Web App, paste the web-app URL below.
 * Posts as text/plain (simple request, no CORS preflight).
 */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbySL-J89e2aMRYteBse33vfpfeC4UG5PGnNPf4fL6FwFSkmsLVHQlgfjUOVcE7eBWLjBA/exec";

(function () {
  const form = document.getElementById("apply-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const thankYou = document.getElementById("thank-you");
  const placeholder = document.getElementById("form-placeholder");
  const submitBtn = form.querySelector('button[type="submit"]');
  const configured = APPS_SCRIPT_URL && APPS_SCRIPT_URL !== "APPS_SCRIPT_URL";

  if (placeholder) {
    placeholder.hidden = !!configured;
  }

  const params = new URLSearchParams(window.location.search);
  const src = (params.get("src") || "Website").trim() || "Website";
  const srcInput = form.querySelector('input[name="src"]');
  if (srcInput) srcInput.value = src;

  function showStatus(kind, message) {
    if (!statusEl) return;
    statusEl.className = "form-status " + kind;
    statusEl.textContent = message;
    statusEl.hidden = false;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (statusEl) statusEl.hidden = true;

    if (!form.consent.checked) {
      showStatus("err", "Please check the box to allow us to contact you by call or text.");
      return;
    }

    if (!configured) {
      showStatus("err", "This form is not connected yet. The recruiter still needs to paste the Google Apps Script web-app URL into js/apply.js.");
      return;
    }

    const payload = {
      name: form.full_name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      discipline: (form.discipline && form.discipline.value) || "",
      license_state: (form.license_state && form.license_state.value.trim()) || "",
      specialty: (form.specialty && form.specialty.value) || "",
      job_title: (form.job_title && form.job_title.value) || "",
      job_id: (form.job_id && form.job_id.value) || "",
      src: src,
      consent: true
    };

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Submitting…";

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const raw = await res.text();
      let data = {};
      try { data = JSON.parse(raw); } catch (e) { data = {}; }

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Something went wrong. Please try again or call your recruiter.");
      }

      form.classList.add("hidden");
      if (placeholder) placeholder.hidden = true;
      if (thankYou) thankYou.classList.add("visible");
    } catch (err) {
      showStatus("err", err.message || "Could not submit. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
