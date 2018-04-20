"use strict";

const VSYNC = 0x80;
const HSYNC = 0x40;

class Vga {
	constructor(options) {
		this.row = 0;
		this.minRow = options.vertical.backPorch;
		this.maxRow = this.minRow + options.vertical.visible;
		this.col = 0;
		this.minCol = options.horizontal.backPorch;
		this.maxCol = this.minCol + options.horizontal.visible;
		this.pixel = 0;
		this.out = 0;
		this.vsyncOccurred = false;
		this.image = createImage(
			options.horizontal.visible,
			options.vertical.visible);
		this.image.loadPixels();
		for (let i = 0; i < this.image.pixels.length; i++) {
			this.image.pixels[i] = 255;
		}
	}

	tick() {
		let out = this.out;

    if ((out & (VSYNC|HSYNC)) != (VSYNC|HSYNC)) {
			// blanking interval
			return;
		}

		if (this.row >= this.minRow && this.row < this.maxRow &&
			  this.col >= this.minCol && this.col < this.maxCol) {
			let pixels = this.image.pixels;
			let pixel = this.pixel;
			let r = (out << 6) & 0xc0;
			let g = (out << 4) & 0xc0;
			let b = (out << 2) & 0xc0;

			for (let i = 0; i < 4; i++) {
				pixels[pixel++] = r;
				pixels[pixel++] = g;
				pixels[pixel++] = b;
				pixel++;
			}

			this.pixel = pixel;
		}

		this.col += 4;
	}

	onOut(out) {
		let falling = this.out & ~out;

		this.out = out;

		if (falling & VSYNC) {
			this.row = 0;
			this.pixel = 0;
			this.vsyncOccurred = true;
		}

		if (falling & HSYNC) {
			this.col = 0;
			this.row++;
		}
	}

	refresh() {
		this.image.updatePixels();
		image(this.image, 0, 0);
	}
}