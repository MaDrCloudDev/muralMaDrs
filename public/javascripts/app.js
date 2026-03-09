const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');

if (navToggle && navMenu) {
	navToggle.addEventListener('click', () => {
		const isOpen = navMenu.classList.toggle('is-open');
		navToggle.setAttribute('aria-expanded', String(isOpen));
	});
}

for (const alertClose of document.querySelectorAll('[data-dismiss-alert]')) {
	alertClose.addEventListener('click', () => {
		alertClose.closest('.alert')?.remove();
	});
}

for (const toggleButton of document.querySelectorAll('[data-toggle-password]')) {
	toggleButton.addEventListener('click', () => {
		const targetId = toggleButton.getAttribute('data-toggle-password');
		if (!targetId) {
			return;
		}

		const input = document.getElementById(targetId);
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const isPassword = input.type === 'password';
		input.type = isPassword ? 'text' : 'password';
		toggleButton.textContent = isPassword ? 'Hide' : 'Show';
	});
}

for (const form of document.querySelectorAll('[data-validated-form]')) {
	form.addEventListener('submit', (event) => {
		if (!(form instanceof HTMLFormElement)) {
			return;
		}

		if (!form.checkValidity()) {
			event.preventDefault();
			event.stopPropagation();
			form.classList.add('was-validated');
			return;
		}

		const submitButton = form.querySelector('[data-submit-button]');
		if (submitButton instanceof HTMLButtonElement) {
			const textSlot = submitButton.querySelector('[data-submit-text]');
			const loadingSlot = submitButton.querySelector('[data-submit-loading]');
			if (textSlot) {
				textSlot.hidden = true;
			}
			if (loadingSlot) {
				loadingSlot.hidden = false;
			}
			submitButton.disabled = true;
		}
	});
}

for (const input of document.querySelectorAll('[data-image-input]')) {
	input.addEventListener('change', () => {
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		const targetId = input.getAttribute('data-preview-target');
		if (!targetId) {
			return;
		}

		const preview = document.getElementById(targetId);
		if (!preview) {
			return;
		}

		preview.innerHTML = '';

		const files = Array.from(input.files ?? []);
		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				continue;
			}

			const imageURL = URL.createObjectURL(file);
			const tile = document.createElement('figure');
			tile.className = 'preview-item';
			tile.innerHTML = `
				<img src="${imageURL}" alt="${file.name}">
				<figcaption>${file.name}</figcaption>
			`;
			preview.appendChild(tile);
		}
	});
}

for (const button of document.querySelectorAll('[data-confirm]')) {
	button.addEventListener('click', (event) => {
		const message = button.getAttribute('data-confirm') ?? 'Are you sure?';
		if (!window.confirm(message)) {
			event.preventDefault();
		}
	});
}

const mainImage = document.getElementById('mural-main-image');
for (const thumb of document.querySelectorAll('[data-gallery-thumb]')) {
	thumb.addEventListener('click', () => {
		if (!(mainImage instanceof HTMLImageElement)) {
			return;
		}
		const url = thumb.getAttribute('data-image-url');
		if (!url) {
			return;
		}

		mainImage.src = url;

		for (const candidate of document.querySelectorAll('[data-gallery-thumb]')) {
			candidate.classList.remove('is-current');
		}
		thumb.classList.add('is-current');
	});
}
