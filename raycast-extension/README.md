# AI Video Transcriber for Raycast

Quickly transcribe and summarize videos from YouTube, Bilibili, and 30+ platforms directly from Raycast.

## Features

- 🎥 **Multi-Platform Support**: Works with YouTube, TikTok, Bilibili, and 30+ more platforms
- 🗣️ **Intelligent Transcription**: High-accuracy speech-to-text using Faster-Whisper
- 🤖 **AI Text Optimization**: Automatic typo correction, sentence completion, and intelligent paragraphing
- 🌍 **Multi-Language Summaries**: Generate intelligent summaries in multiple languages
- ⚡ **Real-Time Progress**: Live progress tracking directly in Raycast
- 📋 **Task Management**: View and manage all your transcription tasks

## Commands

### Transcribe Video

Start transcribing a video from a URL. The command will:
1. Accept a video URL
2. Let you choose the summary language
3. Show real-time progress as the video is downloaded, transcribed, and summarized
4. Display the final transcript and summary
5. Provide options to download the results

### View Transcription Tasks

View and manage all your transcription tasks. Features:
- See all tasks at a glance
- Real-time status updates for ongoing tasks
- View detailed results for completed tasks
- Copy transcripts and summaries to clipboard
- Download results as Markdown files
- Delete unwanted tasks

## Prerequisites

Before using this extension, you need to have the AI Video Transcriber backend running:

1. Make sure the backend is installed and running (default: `http://localhost:8000`)
2. For AI summary features, configure your OpenAI API key in the backend

See the [main repository](https://github.com/wendy7756/AI-Video-Transcriber) for installation instructions.

## Configuration

### API URL
Set the URL of your AI Video Transcriber backend (default: `http://localhost:8000`)

### Default Summary Language
Choose the default language for video summaries:
- English
- Chinese (Simplified)
- Japanese
- Korean
- Spanish
- French
- German
- And more...

## Usage Tips

1. **Quick Transcription**: Use the "Transcribe Video" command and paste your video URL
2. **Monitor Progress**: The extension shows real-time progress updates
3. **Download Results**: After completion, use the download actions to save files
4. **Copy to Clipboard**: Quickly copy summaries or transcripts with keyboard shortcuts
5. **Task Management**: Use "View Transcription Tasks" to manage multiple videos

## Keyboard Shortcuts

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

## Development

To run this extension in development mode:

```bash
cd raycast-extension
npm install
npm run dev
```

## Support

For issues, questions, or feature requests, please visit the [GitHub repository](https://github.com/wendy7756/AI-Video-Transcriber).
