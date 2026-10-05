import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

let ffmpegPath: string | null | undefined;

/**
 * Finds an ffmpeg with an H.264 encoder. Playwright's bundled ffmpeg only
 * encodes VP8, so a system ffmpeg (brew, apt) is required for MP4 output.
 */
export function findFfmpeg(): string | null {
  if (ffmpegPath !== undefined) return ffmpegPath;
  const candidate = process.env.FFMPEG_PATH ?? 'ffmpeg';
  const probe = spawnSync(candidate, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  ffmpegPath = probe.status === 0 && /libx264|h264_videotoolbox|h264_nvenc/.test(probe.stdout) ? candidate : null;
  return ffmpegPath;
}

/**
 * Converts Playwright's WebM recording to an MP4 that every browser plays
 * (Safari does not decode VP8/WebM). Returns the MP4 path, or null when no
 * capable ffmpeg is installed; callers then keep serving the WebM.
 */
export function convertToMp4(webmPath: string): string | null {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg || !existsSync(webmPath)) return null;
  const mp4Path = webmPath.replace(/\.webm$/, '.mp4');
  if (existsSync(mp4Path)) return mp4Path;
  const result = spawnSync(
    ffmpeg,
    ['-hide_banner', '-loglevel', 'error', '-y', '-i', webmPath, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4Path],
    { encoding: 'utf8' },
  );
  return result.status === 0 && existsSync(mp4Path) ? mp4Path : null;
}
