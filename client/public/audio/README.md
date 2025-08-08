# Voice Instructions Audio Files

Place your MP3 audio files here for custom voice instructions.

## Required Audio Files (4 Essential):

1. **starting.mp3** - "Starting scan. Look straight ahead."
2. **turnleft.mp3** - "Front view captured. Now turn your head to the left."
3. **turnright.mp3** - "Left view captured. Now turn your head to the right."
4. **complete.mp3** - "Right view captured. Scanning complete!"

## Audio Requirements:
- Format: MP3
- Quality: 128kbps or higher
- Duration: Keep each file under 5 seconds
- Voice: Clear, professional female voice recommended

## How to Add:
1. Create your MP3 files with the exact names listed above
2. Place them in this folder
3. The system will automatically use them if browser speech synthesis fails

## Voice Instructions Flow:
1. **Visual countdown** (5, 4, 3, 2, 1) - no voice
2. **"Look straight ahead"** - voice instruction (starting.mp3)
3. **"Turn head to the left"** - voice instruction (turnleft.mp3)
4. **"Turn head to the right"** - voice instruction (turnright.mp3)
5. **"Scanning complete"** - voice instruction (complete.mp3)

## Fallback System:
- First tries browser speech synthesis
- If that fails, uses these custom audio files
- If no audio files, shows text instructions only 