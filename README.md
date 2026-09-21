# Stega_What

Stega_What is a responsive, arcade-themed image steganography web application. It hides a text message inside an image and extracts compatible hidden messages directly in the browser.

## Features

- Encode a secret message into an image and download the result as PNG
- Scan a compatible image to reveal its hidden message
- Optional passphrase field
- Responsive interface for mobile, tablet, laptop, and desktop
- Google Analytics page-view and `stega_encode` / `stega_scan` events
- Image processing happens locally in the browser

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Analytics

The Google Analytics measurement ID is configured in `app/layout.tsx`. Analytics records page views and action counts only. Images, hidden messages, and passphrases are not sent to Google Analytics.

## Important note

Steganography hides the existence of a message; it is not a substitute for strong encryption. Do not use the application for illegal activity or to store highly sensitive information without additional encryption.

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide icons
