# GreenDome Travel & Tours

> Pakistan's trusted Umrah & travel specialists — group packages, international tours, and domestic journeys.

A modern, multi-page marketing website built with **HTML**, **CSS**, and **JavaScript**. No backend, no database — inquiry forms submit directly to **Google Sheets** via Apps Script.

---

## Live Preview

Run locally with XAMPP, WAMP, or any static file server:

```
http://localhost/greendome_website/
```

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, stats, Umrah packages, services, testimonials |
| Umrah Packages | `umrah.html` | Muharram 2026 packages, inclusions, booking modal, custom inquiry |
| International | `international.html` | Destination tiles + inquiry form |
| Domestic | `domestic.html` | Pakistan tour destinations + inquiry form |
| About | `about.html` | Why GreenDome, mission, process, testimonials |
| Contact | `contact.html` | Office details, WhatsApp, general inquiry form |

---

## Features

- **Multi-page layout** with shared navigation and active page highlighting
- **Responsive design** — mobile, tablet, and desktop breakpoints
- **Scroll animations** via Intersection Observer (fade-in / slide-up)
- **Animated stats counter** on the home page
- **Package booking modal** with labeled form fields and focus trap
- **Unified form handler** — all forms POST JSON to Google Sheets
- **Brand design system** — forest green primary with subtle gold accents
- **Pure CSS marquee**, process steps, destination grids, and package cards
- **Scroll-to-top** button and sticky blur navbar

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic) |
| Styling | Custom CSS3 (Grid, Flexbox, CSS variables) |
| Script | Vanilla ES6+ JavaScript |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Icons | [Material Icons](https://fonts.google.com/icons) |
| Forms | Google Apps Script Web App → Google Sheets |

No frameworks. No build step. No dependencies.

---

## Project Structure

```
greendome_website/
├── index.html              # Home
├── umrah.html              # Umrah packages
├── international.html      # International travel
├── domestic.html           # Domestic Pakistan tours
├── about.html              # About us
├── contact.html            # Contact & inquiry
├── css/
│   └── style.css           # Design system & all styles
├── js/
│   └── main.js             # All interactive logic
├── assets/
│   └── images/             # Logo, Kaaba, destination photos
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hanzalamaw/greendome_website.git
cd greendome_website
```

### 2. Serve locally

**XAMPP (Windows)** — place the folder in `htdocs/` and open:

```
http://localhost/greendome_website/
```

**Python (any OS)**

```bash
python -m http.server 8080
# → http://localhost:8080
```

**VS Code** — use the *Live Server* extension and open `index.html`.

### 3. Connect forms to Google Sheets

1. Create a Google Sheet with these columns:

   `Timestamp | Form Type | Full Name | Phone | Email | Travelers | Package/Destination | Message`

2. Go to **Extensions → Apps Script** and paste the script from [`google-apps-script/Code.gs`](google-apps-script/Code.gs), or use:

   ```javascript
   function doPost(e) {
     try {
       if (!e || !e.postData || !e.postData.contents) {
         return ContentService.createTextOutput(
           JSON.stringify({ result: "error", message: "No POST data" })
         ).setMimeType(ContentService.MimeType.JSON);
       }
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data = JSON.parse(e.postData.contents);
       sheet.appendRow([
         new Date(),
         data.formType,
         data.fullName,
         data.phone,
         data.email,
         data.travelers,
         data.interest,
         data.message
       ]);
       return ContentService
         .createTextOutput(JSON.stringify({ result: "success" }))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (err) {
       return ContentService
         .createTextOutput(JSON.stringify({ result: "error", message: String(err) }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   }

   // Run this from the editor to test — NOT doPost
   function testAppendRow() {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     sheet.appendRow([
       new Date(), "Test Inquiry", "Test User", "+92 331 7259177",
       "test@example.com", 2, "Quad Sharing", "Editor test row"
     ]);
   }
   ```

3. **Test the sheet connection:** select `testAppendRow` in the function dropdown → click **Run** → authorize if prompted → check your sheet for a new row.

   > **Do not click Run on `doPost`.** That causes `Cannot read properties of undefined (reading 'postData')` because the editor does not send HTTP POST data. `doPost` only runs when your website submits a form.

4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**

5. Copy the deployment URL and set it at the top of `js/main.js`:

   ```javascript
   const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
   ```

6. **Verify the deployment:** open the URL in your browser. You should see:
   `{"result":"ok","message":"GreenDome form endpoint is live"}` *(if using the full script from `google-apps-script/Code.gs`)*

> Until the URL is configured, forms simulate a successful submission for UI testing.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `postData` undefined when clicking Run | Use `testAppendRow` instead — `doPost` only works via deployed Web App |
| Form shows success but no row in sheet | Redeploy Web App after code changes; set **Who has access: Anyone** |
| Authorization required | Run `testAppendRow` once and approve Google permissions |
| Old URL not working | Deploy → **New deployment** (not Edit) to get a fresh URL |

---

## Current Umrah Package

**Muharram Umrah Group Package 2026** · 11 Days · Limited Seats

| Sharing | Price (PKR) |
|---------|-------------|
| Quad Sharing | 275,000 |
| Triple Sharing | 305,000 |
| Double Sharing | 355,000 |

**Departure:** 27th June, 2026 *(Tentative)*

Full inclusions (flights, visa, Voco Makkah, ODST Madinah, ziyarat, group leader, and more) are listed on the [Umrah page](umrah.html).

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#1a3a2a` | Headings, buttons, dark sections |
| `--accent` | `#4a9460` | Links, checkmarks |
| `--gold` | `#c5a028` | Labels, badges, stars, accents |
| `--gold-light` | `#dbb84a` | Highlights on dark backgrounds |
| `--dark-bg` | `#0f1f17` | Footer, process section |

Typography: **Inter** (300–800). Section labels use uppercase tracking in gold.

---

## Contact

| | |
|---|---|
| **Phone / WhatsApp** | [+92 331 7259177](https://wa.me/923317259177) |
| **Email** | info@greendometravels.com |
| **Address** | B-655, F.B Area Block 13, Karachi |
| **Hours** | Mon – Sat: 12 P.M – 12 A.M |

---

## Browser Support

Works in all modern browsers:

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+

---

## License

© 2025 **GreenDome Travel & Tours**. All rights reserved.

---

<p align="center">
  <strong>GreenDome Travel & Tours</strong><br>
  Spiritual journeys. Seamless travel. Trusted service.
</p>
