export interface Track {
  title: string;
  src: string;
  lrc: string;
}

export interface LyricLine {
  timeMs: number;
  text: string;
}

export const TRACKS: Track[] = [
  {
    title: '把喜欢吹进风 (夏日版) · 雪球',
    src: '/music/把喜欢吹进风 (夏日版) - 雪球.mp3',
    lrc: '/music/把喜欢吹进风 (夏日版) - 雪球.lrc',
  },
  {
    title: 'オトノケ · Creepy Nuts',
    src: '/music/オトノケ - Otonoke - Creepy Nuts.mp3',
    lrc: '/music/オトノケ - Otonoke - Creepy Nuts.lrc',
  },
];

const TIMESTAMP = /\[(\d{2}):(\d{2})\.(\d{3})\]/g;

export function parseLrc(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const tags = [...line.matchAll(TIMESTAMP)];
    if (tags.length === 0) continue;

    const text = line.slice(line.lastIndexOf(']') + 1);
    for (const [, minutes, seconds, milliseconds] of tags) {
      lines.push({
        timeMs:
          Number(minutes) * 60_000 + Number(seconds) * 1_000 + Number(milliseconds),
        text,
      });
    }
  }

  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

export function findLyricIndex(lines: LyricLine[], seconds: number): number {
  const targetMs = seconds * 1000;
  let low = 0;
  let high = lines.length - 1;
  let result = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (lines[middle].timeMs <= targetMs) {
      result = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return result;
}
