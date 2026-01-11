# Raycast Extension Setup Guide

This guide will help you set up and install the AI Video Transcriber extension for Raycast.

## Prerequisites

1. **Raycast**: Install Raycast from [raycast.com](https://www.raycast.com/)
2. **Node.js**: Version 20 or higher
3. **Backend Server**: The AI Video Transcriber backend must be running

## Installation Steps

### 1. Install Dependencies

```bash
cd raycast-extension
npm install
```

### 2. Add Extension Icon

You need to add a `command-icon.png` file (512x512 pixels) to the `assets` directory.

Quick solution - create a simple text-based icon:
```bash
# Using macOS to create a simple icon from emoji
# (Requires ImageMagick: brew install imagemagick)
cd assets
convert -size 512x512 xc:white -font Arial -pointsize 300 -fill black -gravity center -annotate +0+0 "🎥" command-icon.png
```

Or download/create your own 512x512 PNG icon and save it as `assets/command-icon.png`.

### 3. Start the Backend Server

Make sure the AI Video Transcriber backend is running:

```bash
cd ..  # Go back to the main project directory
$HOME/.local/bin/uv run python3 start.py
```

The backend should be accessible at `http://localhost:8000`.

### 4. Development Mode

Run the extension in development mode:

```bash
cd raycast-extension
npm run dev
```

This will open Raycast with your extension loaded. You can now test the commands.

### 5. Build for Production (Optional)

To build the extension for production:

```bash
npm run build
```

## Configuration

After installation, open Raycast preferences and configure:

1. **API URL**: Set to your backend URL (default: `http://localhost:8000`)
2. **Default Summary Language**: Choose your preferred language for summaries

## Usage

### Transcribe Video Command

1. Open Raycast (`⌘ Space` or your configured hotkey)
2. Type "Transcribe Video"
3. Enter the video URL
4. Select the summary language
5. Press Enter to start transcription
6. Watch the progress in real-time
7. View and download results when complete

### View Transcription Tasks Command

1. Open Raycast
2. Type "View Transcription Tasks"
3. Browse all your tasks
4. Select a task to view details
5. Use keyboard shortcuts to copy or download results

## Troubleshooting

### Extension doesn't load
- Make sure you've added the `command-icon.png` file
- Check that all dependencies are installed: `npm install`
- Try rebuilding: `npm run build`

### Can't connect to backend
- Verify the backend is running: `curl http://localhost:8000`
- Check the API URL in Raycast extension preferences
- Ensure the port is not blocked by a firewall

### No summaries generated
- Check if OPENAI_API_KEY is set in the backend
- View backend logs for errors
- Try a shorter video first to test

## Keyboard Shortcuts Reference

### Transcribe Video
- `Enter` - Submit and start transcription

### View Tasks
- `↵` - View task details
- `⌘C` - Copy task ID
- `⌘⇧C` - Copy video URL
- `⌘D` - Delete task
- `⌘R` - Refresh task list
- `⌘⇧S` - Copy summary (in detail view)
- `⌘⇧T` - Copy transcript (in detail view)
- `Esc` - Go back

## Support

For issues or questions:
- GitHub: [AI-Video-Transcriber Issues](https://github.com/wendy7756/AI-Video-Transcriber/issues)
- Check the main README for backend configuration
