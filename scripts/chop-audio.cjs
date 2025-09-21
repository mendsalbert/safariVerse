const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Configuration
const INPUT_FILE = path.join(__dirname, "../public/radio/radio.mp3");
const OUTPUT_DIR = path.join(__dirname, "../public/radio/chunks");
const CHUNK_DURATION = 3 * 60; // 3 minutes per chunk (in seconds)
const CHUNK_NAME_PREFIX = "radio-chunk";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function getAudioDuration(filePath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error("Error getting audio duration:", error.message);
    // Fallback: assume 50 minutes as mentioned
    return 50 * 60;
  }
}

async function chopAudio() {
  try {
    console.log("🎵 Starting audio chopping process...");

    // Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Input file not found: ${INPUT_FILE}`);
      return;
    }

    // Get audio duration
    const duration = await getAudioDuration(INPUT_FILE);
    console.log(
      `📏 Audio duration: ${Math.round(
        duration / 60
      )} minutes (${duration} seconds)`
    );

    // Calculate number of chunks
    const numChunks = Math.ceil(duration / CHUNK_DURATION);
    console.log(
      `✂️  Will create ${numChunks} chunks of ${
        CHUNK_DURATION / 60
      } minutes each`
    );

    // Create chunks
    const chunks = [];
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * CHUNK_DURATION;
      const chunkName = `${CHUNK_NAME_PREFIX}-${String(i + 1).padStart(
        2,
        "0"
      )}.mp3`;
      const outputPath = path.join(OUTPUT_DIR, chunkName);

      console.log(`🔄 Creating chunk ${i + 1}/${numChunks}: ${chunkName}`);

      try {
        // Use FFmpeg to extract chunk
        const ffmpegCommand = `ffmpeg -i "${INPUT_FILE}" -ss ${startTime} -t ${CHUNK_DURATION} -acodec copy "${outputPath}" -y`;
        await execAsync(ffmpegCommand);

        chunks.push({
          id: `chunk-${i + 1}`,
          name: `Safari Radio - Part ${i + 1}`,
          filename: chunkName,
          url: `/radio/chunks/${chunkName}`,
          duration: Math.min(CHUNK_DURATION, duration - startTime),
          startTime: startTime,
        });

        console.log(`✅ Created: ${chunkName}`);
      } catch (error) {
        console.error(`❌ Failed to create chunk ${i + 1}:`, error.message);
      }
    }

    // Create manifest file
    const manifest = {
      title: "Safari Radio Chunks",
      totalDuration: duration,
      chunkDuration: CHUNK_DURATION,
      totalChunks: chunks.length,
      chunks: chunks,
      createdAt: new Date().toISOString(),
    };

    const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`📋 Created manifest: ${manifestPath}`);
    console.log(`🎉 Audio chopping complete! Created ${chunks.length} chunks.`);

    return manifest;
  } catch (error) {
    console.error("❌ Error during audio chopping:", error);
  }
}

// Alternative method using Web Audio API compatible approach
async function chopAudioWithoutFFmpeg() {
  console.log("🎵 FFmpeg not available, creating virtual chunks...");

  try {
    const duration = 50 * 60; // 50 minutes in seconds
    const numChunks = Math.ceil(duration / CHUNK_DURATION);

    const chunks = [];
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * CHUNK_DURATION;
      const endTime = Math.min(startTime + CHUNK_DURATION, duration);

      chunks.push({
        id: `chunk-${i + 1}`,
        name: `Safari Radio - Part ${i + 1}`,
        filename: "radio.mp3", // Use original file
        url: `/radio/radio.mp3`,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime,
        virtual: true, // Flag to indicate this needs special handling
      });
    }

    const manifest = {
      title: "Safari Radio Virtual Chunks",
      totalDuration: duration,
      chunkDuration: CHUNK_DURATION,
      totalChunks: chunks.length,
      chunks: chunks,
      virtual: true,
      createdAt: new Date().toISOString(),
    };

    const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`📋 Created virtual manifest: ${manifestPath}`);
    console.log(
      `🎉 Virtual chunking complete! Created ${chunks.length} virtual chunks.`
    );

    return manifest;
  } catch (error) {
    console.error("❌ Error during virtual chunking:", error);
  }
}

// Main execution
async function main() {
  try {
    // Try with FFmpeg first
    const manifest = await chopAudio();
    if (!manifest) {
      // Fallback to virtual chunks
      await chopAudioWithoutFFmpeg();
    }
  } catch (error) {
    console.error("❌ Main execution failed:", error);
    // Fallback to virtual chunks
    await chopAudioWithoutFFmpeg();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { chopAudio, chopAudioWithoutFFmpeg };
