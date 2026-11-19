# Medical Solutions travel-allied job site

Static, deploy-ready site for public job pages, a jobs hub, and a free form-to-Google-Sheet + email flow.

## What’s in this folder

| Path | Purpose |
|---|---|
| `index.html` | Jobs hub (no JobPosting markup). Cards are rendered from `js/jobs.js`. |
| `jobs/travel-ct-tech-hibbing-mn.html` | First live job page, with JobPosting JSON-LD and the apply form. |
| `css/site.css` | Shared styles. |
| `js/jobs.js` | Job list. Add new jobs here. |
| `js/hub.js` | Renders hub cards from `JOBS`. |
| `js/apply.js` | Form handler. Set `APPS_SCRIPT_URL` at the top after you deploy the script. |
| `sitemap.xml` | Replace `SITE_URL` with your live origin (no trailing slash). |
| `robots.txt` | Replace `SITE_URL` the same way. |
| `404.html` | Friendly not-found page (GitHub Pages and Cloudflare Pages both use this filename). |
| `apps_script/Code.gs` | Google Apps Script that writes applicants to the tracker and emails `chrysmedsol@gmail.com`. |

Public pages do not include bill rates, facility name or street address, or internal notes.

## 1. Connect the apply form (Google Apps Script)

1. Open [Google Apps Script](https://script.google.com/) while signed into `chrysmedsol@gmail.com` (or an account that can edit the tracker sheet).
2. New project → paste the contents of `apps_script/Code.gs` into `Code.gs` and save. The spreadsheet ID is already in the file: `1YJuw2hlfeCiv5vP4F14PnaohVPR-6GGJtd8-PAgE5hw`.
3. If this account is not the sheet owner, share the sheet with it as Editor.
4. Deploy → New deployment → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize the script when prompted (Sheets + Gmail).
6. Copy the web-app URL (it looks like `https://script.google.com/macros/s/…/exec`).
7. Paste that URL into `js/apply.js` as the `APPS_SCRIPT_URL` constant at the top. Leave the quotes; do not commit a fake URL.
8. Test: open a job page, submit your own name/phone/email, confirm a row appears on the **Applicants** tab and an email arrives at `chrysmedsol@gmail.com`.

The browser posts `Content-Type: text/plain` with a JSON body so the request stays “simple” and avoids a CORS preflight. `Source Board` comes from `?src=` on the job URL (for example `jobs/travel-ct-tech-hibbing-mn.html?src=LinkedIn`) and defaults to `Website`.

If you change the script later, Deploy → Manage deployments → the pencil icon → **New version**, so the same URL keeps working.

## 2. Replace the site URL placeholders

Before you ask Google to crawl the site, replace every `SITE_URL` in `sitemap.xml` and `robots.txt` with the live origin, no trailing slash. Examples:

- Cloudflare Pages custom domain: `https://jobs.example.com`
- Cloudflare Pages default: `https://your-project.pages.dev`
- GitHub Pages user/organization site: `https://youruser.github.io`
- GitHub Pages project site: `https://youruser.github.io/your-repo`

Links inside the HTML are relative, so a project-site path prefix still works.

## 3. Add another job later

1. Copy `jobs/travel-ct-tech-hibbing-mn.html`, update the visible copy, the JSON-LD (`title` stays the job title only — put pay in the HTML `<title>` / H1 and in `baseSalary`), and the hidden `job_id` / `job_title` / `specialty` fields.
2. Append a matching object to the `JOBS` array in `js/jobs.js` (`status: "open"`).
3. Add the new URL to `sitemap.xml`.
4. Add a row to the **Job Postings** tab of the tracker.
5. After go-live, ping Google with the Indexing API (`URL_UPDATED`). When the job fills, take the page down or set `validThrough` in the past and send `URL_DELETED`.

## 4. Hosting

Both of the free options below can serve this folder as a static site. You still need to connect the Apps Script URL (step 1) either way.

### Cloudflare Pages (usually the easier first deploy)

- Needs a free [Cloudflare account](https://dash.cloudflare.com/sign-up). A GitHub account is optional: you can drag-and-drop this folder with **Direct Upload**, or connect a Git repo for automatic deploys.
- Create a project, set the output/root directory to this folder (or the repo root if this folder *is* the repo), and deploy.
- Custom domain is optional. Use HTTPS.
- After deploy, put the origin into `SITE_URL` and redeploy, and add `APPS_SCRIPT_URL` if you have not already.

### GitHub Pages

- Needs a [GitHub account](https://github.com/signup) and a repository (public repos are free to host).
- Push this folder as the repo root (recommended) or as the `docs/` folder.
- Settings → Pages → Deploy from branch (`main` / root, or `/docs`).
- Project sites are served at `https://<user>.github.io/<repo>/`. Relative links in this site already support that. User/organization sites (`https://<user>.github.io/`) or a custom domain are cleaner for Google for Jobs.
- After the site is live, replace `SITE_URL` and commit again.

### After the site is public

1. Open [Google Search Console](https://search.google.com/search-console), verify the domain or URL-prefix property, and submit `sitemap.xml`.
2. Test a job URL in the [Rich Results Test](https://search.google.com/test/rich-results) and in URL Inspection, then request indexing.
3. For faster recrawls of job URLs, use the [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart) (`JobPosting` pages only; default 200 publishes/day; free). Add the API service account as a Search Console owner.
4. Update the **Job Postings** tab: set **Post URL** to the live job URL and **Status** from `Draft` to `Live`.

## Tracker sheet

[Medical Solutions – Allied Applicant Tracker](https://docs.google.com/spreadsheets/d/1YJuw2hlfeCiv5vP4F14PnaohVPR-6GGJtd8-PAgE5hw)

- **Applicants** is filled automatically by the Apps Script.
- **Job Postings** is maintained by you (the Hibbing CT job was added as Status `Draft`, Post URL `pending`, Board `Website`). Facility name is only in this private sheet, not on the public pages.
