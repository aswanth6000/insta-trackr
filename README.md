# Insta Trackr

A browser extension that helps you find Instagram users who don't follow you back.

## Features

- 🔍 Automatically fetches your followers and following lists
- 📊 Compares the two lists to find non-followers
- 🎨 Beautiful, Instagram-inspired UI
- ⚡ Fast and efficient data fetching
- 🔒 Uses your existing Instagram session (no additional login required)

## Installation

### For Normal Users

1. Download the latest release from the [Releases](./releases/) page
2. Extract the ZIP file to a folder on your computer
3. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
4. Enable "Developer mode" (toggle in the top right)
5. Click "Load unpacked"
6. Select the extracted folder (the one containing `manifest.json`) (Not the zip make sure to unzip)

### For Developers

1. Clone the repository:

```bash
git clone <your-repo-url>
cd insta-trackr
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Load the extension in Chrome/Edge:
   - Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Usage

1. **Log into Instagram**: Make sure you're logged into Instagram in your browser
2. **Open the extension**: Click the extension icon in your browser toolbar
3. **Analyze**: Click the "Analyze Followers" button
4. **View results**: The extension will automatically open results in a new tab, so you can keep them open while browsing

## How It Works

The extension:

1. Extracts your Instagram user ID from the current session
2. Fetches your complete followers list using Instagram's API
3. Fetches your complete following list using Instagram's API
4. Compares the two lists to find users you follow but who don't follow you back
5. Displays the results in an easy-to-read format

## Technical Details

- **Manifest V3**: Uses the latest Chrome extension manifest format
- **React + TypeScript**: Built with modern web technologies
- **Vite**: Fast build tool for development and production
- **Content Scripts**: Extracts user ID from Instagram pages
- **Background Service Worker**: Handles API requests with proper authentication

## Project Structure

```
insta-trackr/
├── src/
│   ├── App.tsx              # Main popup UI component
│   ├── background/
│   │   └── background.ts   # Service worker for API requests
│   ├── content/
│   │   └── content.ts       # Content script for user ID extraction
│   └── utils/
│       └── instagramApi.ts  # Instagram API utilities
├── manifest.json            # Extension manifest
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

## Development

### Build for production:

```bash
npm run build
```

### Development mode (for testing React components):

```bash
npm run dev
```

## Important Notes

- ⚠️ This extension requires you to be logged into Instagram
- ⚠️ The extension uses Instagram's internal API, which may change without notice
- ⚠️ Rate limiting: The extension includes delays to avoid Instagram's rate limits
- ⚠️ Privacy: All data processing happens locally in your browser

## Troubleshooting

### Extension not detecting user ID

- Make sure you're logged into Instagram
- Open Instagram in a new tab and refresh the extension popup
- Check the browser console for any error messages

### API requests failing

- Ensure you're logged into Instagram
- Check that Instagram hasn't changed their API structure
- Verify the extension has the necessary permissions

## License

MIT

## Disclaimer

This extension is for personal use only. Use responsibly and in accordance with Instagram's Terms of Service.
