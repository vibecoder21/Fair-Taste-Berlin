# Fair Taste Berlin

This repo contains a simple form for submitting job applications and a small Node server that relays submissions via email.

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an `.env` file based on `.env.example` and provide the SMTP credentials.
3. Start the server:
   ```bash
   npm start
   ```
   The server will listen on port `3000` by default.

## Deploying static site

When hosting the front‑end on a different domain (for example GitHub Pages) you need to specify the URL of your backend API. Edit the `window.API_BASE_URL` value in `index.html` or set it dynamically before `app.js` is loaded:

```html
<script>
  window.API_BASE_URL = "https://your-backend.example.com";
</script>
<script src="app.js"></script>
```

The form will post to `<API_BASE_URL>/api/apply`.
