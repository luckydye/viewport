export class RenderPass {

	get buffer() {
		return this.renderer.getBufferTexture(this.id);
	}

	get depthbuffer() {
		return this.renderer.getBufferTexture(this.id + '.depth');
	}

	constructor(renderer, id, setup = {
		resolution: null,
		colorBuffer: true,
		depthbuffer: true,
	}) {
		this.id = id;
		this.sceneSetup = setup;
		this.shader = setup.shaderOverwrite;
		this.renderer = renderer;

		this.resolution = setup.resolution || [];

		this.width = this.resolution[0] || renderer.width;
		this.height = this.resolution[1] || renderer.height;

		this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height, setup.depthbuffer, setup.colorBuffer);
	}

	resize(width, height) {
		if (!this.resolution[0]) {
			this.width = width;
			this.height = height;

			this.fbo = this.renderer.createFramebuffer(this.id, this.width, this.height);
		}
	}

	use() {
		this.fbo.use();

		this.renderer.viewport(this.width, this.height);

		if (this.shader) {
			this.renderer.useShader(this.shader);
		}
	}

	finalize() {
		this.fbo.finalize();
	}
}
