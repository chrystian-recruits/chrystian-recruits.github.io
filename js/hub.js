(function () {
  const mount = document.getElementById("job-grid");
  if (!mount || !Array.isArray(window.JOBS)) return;

  const open = window.JOBS.filter(function (job) { return job.status === "open"; });
  if (!open.length) {
    mount.innerHTML = '<p class="empty-jobs">No open jobs are listed right now. Please check back soon.</p>';
    return;
  }

  mount.innerHTML = open.map(function (job) {
    const title = escapeHtml(job.titleWithPay || (job.title + " – " + job.payDisplay + " – " + job.city));
    return (
      '<a class="job-card" href="' + encodeURI(job.url) + '">' +
        "<h2>" + title + "</h2>" +
        '<p class="pay">' + escapeHtml(job.payDisplay) + "</p>" +
        '<p class="job-meta">' + escapeHtml(job.city) + "</p>" +
        '<p class="job-meta">Start: ' + escapeHtml(job.start) + " · " + escapeHtml(job.length) + " · " + escapeHtml(job.shift) + "</p>" +
      "</a>"
    );
  }).join("");

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
