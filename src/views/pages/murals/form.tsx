import type { FC } from 'hono/jsx';

import type { MuralDocument } from '../../../models/mural.js';

interface MuralFormPageProps {
	mode: 'create' | 'edit';
	action: string;
	mural?: Pick<MuralDocument, '_id' | 'title' | 'artist' | 'location' | 'description' | 'images'>;
}

export const MuralFormPage: FC<MuralFormPageProps> = ({ mode, action, mural }) => {
	const isEdit = mode === 'edit';

	return (
		<section class="stack-lg form-shell">
			<header class="section-heading">
				<div>
					<p class="eyebrow">{isEdit ? 'Refine entry' : 'Add new mural'}</p>
					<h1>{isEdit ? 'Edit mural details' : 'Share a mural'}</h1>
				</div>
			</header>
			<form
				action={action}
				method="post"
				enctype="multipart/form-data"
				class="form-grid mural-form"
				novalidate
				data-validated-form
			>
				<div class="field-row">
					<label>
						<span>Title</span>
						<input name="title" required minLength={2} maxLength={140} value={mural?.title ?? ''} />
					</label>
					<label>
						<span>Artist</span>
						<input
							name="artist"
							required
							minLength={2}
							maxLength={120}
							value={mural?.artist ?? ''}
						/>
					</label>
				</div>
				<label>
					<span>Location</span>
					<input
						name="location"
						required
						minLength={3}
						maxLength={180}
						placeholder="Street, neighborhood, and city"
						value={mural?.location ?? ''}
					/>
				</label>
				<label>
					<span>Description</span>
					<textarea
						name="description"
						required
						minLength={10}
						maxLength={3000}
						rows={6}
					>
						{mural?.description ?? ''}
					</textarea>
				</label>

				{isEdit && mural?.images.length ? (
					<section class="image-manager">
						<h2>Current images</h2>
						<ul>
							{mural.images.map((image) => (
								<li key={image.filename}>
									<img src={image.url} alt={mural.title} loading="lazy" />
									<label class="checkbox-row">
										<input type="checkbox" name="deleteImages" value={image.filename} />
										<span>Remove image</span>
									</label>
								</li>
							))}
						</ul>
					</section>
				) : null}

				<label>
					<span>{isEdit ? 'Add more images' : 'Upload images'}</span>
					<input
						type="file"
						name="image"
						accept="image/*"
						multiple
						data-image-input
						data-preview-target="image-preview"
					/>
				</label>
				<div id="image-preview" class="preview-grid" aria-live="polite"></div>

				<div class="form-actions">
					<a class="btn btn-secondary" href={isEdit && mural ? `/murals/${mural._id}` : '/murals'}>
						Cancel
					</a>
					<button class="btn btn-primary" type="submit" data-submit-button>
						<span data-submit-text>{isEdit ? 'Save changes' : 'Publish mural'}</span>
						<span data-submit-loading hidden>
							{isEdit ? 'Saving...' : 'Publishing...'}
						</span>
					</button>
				</div>
			</form>
		</section>
	);
};
