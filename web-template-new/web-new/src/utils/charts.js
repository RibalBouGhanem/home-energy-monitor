// src/utils/charts.js
export function drawMiniChart(canvasId, color) {
	const canvas = document.getElementById(canvasId);
	if (!canvas) return;

	const ctx = canvas.getContext("2d");
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	// Generate random data points
	const points = [];
	for (let i = 0; i < 10; i++) {
		points.push(Math.random() * canvas.height);
	}

	// Draw line
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;

	points.forEach((point, index) => {
		const x = (canvas.width / (points.length - 1)) * index;
		const y = point;

		if (index === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	});

	ctx.stroke();

	// Draw gradient fill
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, `${color}40`);
	gradient.addColorStop(1, `${color}00`);

	ctx.lineTo(canvas.width, canvas.height);
	ctx.lineTo(0, canvas.height);
	ctx.closePath();
	ctx.fillStyle = gradient;
	ctx.fill();
}
