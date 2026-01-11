# Extension Assets

## Required Icon

You need to add a `command-icon.png` file (512x512 pixels) to this directory before the extension can be used.

You can:
1. Create your own icon using any graphics editor
2. Use an emoji screenshot
3. Download a free icon from icon libraries like:
   - [SF Symbols](https://developer.apple.com/sf-symbols/) (macOS)
   - [Flaticon](https://www.flaticon.com/)
   - [Icons8](https://icons8.com/)

The icon should represent video transcription, such as:
- 🎥 Video camera with subtitles
- 🎤 Microphone with text
- 📝 Document with play button

### Quick Solution

Run this command to create a simple placeholder icon:
```bash
# Using ImageMagick (if installed)
convert -size 512x512 xc:white -font Arial -pointsize 200 -fill black -gravity center -annotate +0+0 "🎥" command-icon.png

# Or use any 512x512 PNG image you have
cp /path/to/your/icon.png command-icon.png
```
