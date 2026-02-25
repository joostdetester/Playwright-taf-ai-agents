import { spawn } from 'node:child_process';
import { mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import ffmpegPath from 'ffmpeg-static';

function getArg(name, defaultValue) {
	const prefix = `--${name}=`;
	const found = process.argv.find((a) => a.startsWith(prefix));
	if (!found) return defaultValue;
	return found.slice(prefix.length);
}

async function main() {
	const input = getArg('input');
	const outDir = getArg('outDir');
	const fps = Number(getArg('fps', '0.5'));
	const durationSeconds = Number(getArg('duration', '600'));
	const scaleWidth = Number(getArg('scaleWidth', '1280'));

	if (!input || !outDir) {
		console.error('Usage: node scripts/extract-frames.mjs --input=path/to/video.mp4 --outDir=artifacts/frames/run1 [--fps=0.5] [--duration=600] [--scaleWidth=1280]');
		process.exit(2);
	}

	if (!ffmpegPath) {
		console.error('ffmpeg-static did not provide a binary path.');
		process.exit(2);
	}

	await access(input);
	await mkdir(outDir, { recursive: true });

	const outputPattern = path.join(outDir, 'frame_%05d.png');
	const vf = `fps=${fps},scale=${scaleWidth}:-1`;

	const args = [
		'-hide_banner',
		'-loglevel',
		'error',
		'-y',
		'-t',
		String(durationSeconds),
		'-i',
		input,
		'-vf',
		vf,
		outputPattern,
	];

	console.log(`Running: ${ffmpegPath} ${args.join(' ')}`);

	await new Promise((resolve, reject) => {
		const child = spawn(ffmpegPath, args, { stdio: 'inherit' });
		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) resolve();
			reject(new Error(`ffmpeg exited with code ${code}`));
		});
	});
}

main().catch((err) => {
	console.error(err?.stack || String(err));
	process.exit(1);
});
