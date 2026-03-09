import type { FC } from 'hono/jsx';

import type { MuralDocument } from '../../../models/mural';
import type { ReviewDocument } from '../../../models/review';
import type { UserDocument } from '../../../models/user';

interface PopulatedReview extends Omit<ReviewDocument, 'author'> {
	author: Pick<UserDocument, '_id' | 'username'>;
}

interface PopulatedMural extends Omit<MuralDocument, 'author' | 'reviews'> {
	author: Pick<UserDocument, '_id' | 'username'>;
	reviews: PopulatedReview[];
}

interface MuralShowPageProps {
	mural: PopulatedMural;
	currentUser: UserDocument | null;
}

function canEdit(mural: PopulatedMural, currentUser: UserDocument | null): boolean {
	return Boolean(currentUser && String(mural.author._id) === String(currentUser._id));
}

function canDeleteReview(review: PopulatedReview, currentUser: UserDocument | null): boolean {
	return Boolean(currentUser && String(review.author._id) === String(currentUser._id));
}

function formatRating(rating: number): string {
	return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
}

export const MuralShowPage: FC<MuralShowPageProps> = ({ mural, currentUser }) => {
	const editable = canEdit(mural, currentUser);
	const primaryImage = mural.images[0];
	const mapPayload = {
		coordinates: mural.geometry.coordinates,
		title: mural.title,
		location: mural.location,
	};

	return (
		<section class="stack-lg">
			<article class="mural-detail-grid">
				<div class="stack-md">
					<header class="mural-header-card">
						<div>
							<p class="eyebrow">Mural profile</p>
							<h1>{mural.title}</h1>
							<p class="meta-row">
								<span>{mural.artist}</span>
								<span>{mural.location}</span>
								<span>Added by {mural.author.username}</span>
							</p>
						</div>
						{editable ? (
							<div class="action-row">
								<a class="btn btn-secondary" href={`/murals/${mural._id}/edit`}>
									Edit
								</a>
								<form action={`/murals/${mural._id}/delete`} method="post">
									<button
										type="submit"
										class="btn btn-danger"
										data-confirm="Delete this mural permanently?"
									>
										Delete
									</button>
								</form>
							</div>
						) : null}
					</header>
						<section class="gallery-card">
							{primaryImage ? (
								<>
									<div class="main-image-wrap">
										<img id="mural-main-image" src={primaryImage.url} alt={mural.title} />
									</div>
									<ul class="thumbnail-row">
										{mural.images.map((image) => (
										<li key={image.filename}>
												<button
													type="button"
													data-gallery-thumb
													data-image-url={image.url}
													class={image === primaryImage ? 'is-current' : ''}
												>
												<img src={image.url} alt={mural.title} loading="lazy" />
											</button>
										</li>
									))}
								</ul>
							</>
						) : (
							<div class="empty-media">No images uploaded yet.</div>
						)}
					</section>
					<section class="content-card">
						<h2>About this mural</h2>
						<p>{mural.description}</p>
					</section>
				</div>
				<aside class="stack-md">
					<section class="map-panel">
						<h2>Location</h2>
						<div id="mural-map" class="map-frame small"></div>
					</section>
					{currentUser ? (
						<section class="content-card">
							<h2>Leave a review</h2>
							<form
								action={`/murals/${mural._id}/reviews`}
								method="post"
								class="form-grid"
								novalidate
								data-validated-form
							>
								<label>
									<span>Rating</span>
									<select name="rating" defaultValue="5" required>
										<option value="5">5 - Masterpiece</option>
										<option value="4">4 - Great</option>
										<option value="3">3 - Good</option>
										<option value="2">2 - Fair</option>
										<option value="1">1 - Needs work</option>
									</select>
								</label>
								<label>
									<span>Review</span>
									<textarea name="body" minLength={3} maxLength={1500} rows={4} required></textarea>
								</label>
								<button class="btn btn-primary" type="submit">
									Post review
								</button>
							</form>
						</section>
					) : null}
					<section class="content-card">
						<h2>Reviews ({mural.reviews.length})</h2>
						{mural.reviews.length ? (
							<ul class="review-list">
								{mural.reviews.map((review) => (
									<li key={String(review._id)}>
										<header>
											<div>
												<strong>{review.author.username}</strong>
												<span>{formatRating(review.rating)}</span>
											</div>
											{canDeleteReview(review, currentUser) ? (
												<form
													action={`/murals/${mural._id}/reviews/${review._id}/delete`}
													method="post"
												>
													<button
														type="submit"
														class="ghost-link"
														data-confirm="Delete this review?"
													>
														Delete
													</button>
												</form>
											) : null}
										</header>
										<p>{review.body}</p>
									</li>
								))}
							</ul>
						) : (
							<p class="muted">No reviews yet.</p>
						)}
					</section>
				</aside>
			</article>
			<script id="mural-map-data" type="application/json">
				{JSON.stringify(mapPayload)}
			</script>
		</section>
	);
};
