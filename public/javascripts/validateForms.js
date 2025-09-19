(function () {
	'use strict';

	const forms = document.querySelectorAll('.validated-form');
	Array.from(forms).forEach((form) => {
		form.addEventListener(
			'submit',
			(event) => {
				if (!form.checkValidity()) {
					event.preventDefault();
					event.stopPropagation();
				}

				form.classList.add('was-validated');
			},
			false
		);

		const inputs = form.querySelectorAll('input, textarea, select');
		inputs.forEach((input) => {
			input.addEventListener('input', function () {
				const validFeedback =
					this.parentNode.querySelector('.valid-feedback');
				const invalidFeedback = this.parentNode.querySelector(
					'.invalid-feedback'
				);

				if (this.checkValidity()) {
					this.classList.remove('border-red-500');
					this.classList.add('border-green-500');
					if (validFeedback) validFeedback.classList.remove('hidden');
					if (invalidFeedback)
						invalidFeedback.classList.add('hidden');
				} else {
					this.classList.remove('border-green-500');
					this.classList.add('border-red-500');
					if (validFeedback) validFeedback.classList.add('hidden');
					if (invalidFeedback)
						invalidFeedback.classList.remove('hidden');
				}
			});
		});
	});

	document.addEventListener('DOMContentLoaded', () => {
		const imageInputs = document.querySelectorAll(
			'input[type="file"][accept*="image"]'
		);

		imageInputs.forEach((input) => {
			const previewContainer =
				document.getElementById('image-preview');
			if (!previewContainer) return;

			input.addEventListener('change', (e) => {
				previewContainer.innerHTML = '';
				const files = Array.from(e.target.files);

				files.forEach((file, index) => {
					if (file.type.startsWith('image/')) {
						const reader = new FileReader();
						reader.onload = function (e) {
							const previewItem = document.createElement('div');
							previewItem.className =
								'relative aspect-square rounded-lg overflow-hidden shadow-md';
							previewItem.innerHTML = `
								<img src="${e.target.result}" alt="Preview ${
								index + 1
							}" class="w-full h-full object-cover">
								<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
									<span class="text-white text-xs truncate block">${file.name}</span>
								</div>
							`;
							previewContainer.appendChild(previewItem);
						};
						reader.readAsDataURL(file);
					}
				});
			});
		});

		const toggleButtons =
			document.querySelectorAll('#togglePassword');
		toggleButtons.forEach((button) => {
			button.addEventListener('click', () => {
				const passwordInput = document.getElementById('password');
				const eyeIcon = document.getElementById('eyeIcon');

				const type =
					passwordInput.getAttribute('type') === 'password'
						? 'text'
						: 'password';
				passwordInput.setAttribute('type', type);
				eyeIcon.classList.toggle('fa-eye');
				eyeIcon.classList.toggle('fa-eye-slash');
			});
		});

		const submitButtons = document.querySelectorAll(
			'button[type="submit"]'
		);
		submitButtons.forEach((button) => {
			const form = button.closest('form');
			if (!form) return;

			form.addEventListener('submit', (e) => {
				if (form.checkValidity()) {
					const btnText = button.querySelector('.btn-text');
					const btnLoading = button.querySelector('.btn-loading');

					if (btnText && btnLoading) {
						btnText.classList.add('hidden');
						btnLoading.classList.remove('hidden');
						btnLoading.classList.add('flex');
						button.disabled = true;
					}
				}
			});
		});
	});
})();
