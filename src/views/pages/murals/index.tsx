import type { FC } from 'hono/jsx';

import type { MuralDocument } from '../../../models/mural';
import type { UserDocument } from '../../../models/user';

interface MuralsIndexPageProps {
	murals: Array<
		Pick<MuralDocument, '_id' | 'title' | 'artist' | 'description' | 'location' | 'images'> & {
			popupMarkup?: string;
			geometry: {
				type: 'Point';
				coordinates: [number, number];
			};
		}
	>;
	currentUser: UserDocument | null;
}

function heroImage(url?: string): string {
	if (url) {
		return url;
	}

	return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80';
}

export const MuralsIndexPage: FC<MuralsIndexPageProps> = ({ murals, currentUser }) => {
	const mapFeatures = {
		type: 'FeatureCollection',
		features: murals.map((mural) => ({
			type: 'Feature',
			geometry: mural.geometry,
			properties: {
				id: String(mural._id),
				title: mural.title,
				popupMarkup:
					mural.popupMarkup ??
					`<strong><a href="/murals/${mural._id}">${mural.title}</a></strong><p>${mural.location}</p>`,
			},
		})),
	};

	return (
		<section class="stack-lg">
			<header class="section-heading">
				<div>
					<p class="eyebrow">Gallery</p>
					<h1>Explore murals by city block</h1>
				</div>
				<a class="btn btn-primary" href={currentUser ? '/murals/new' : '/login'}>
					{currentUser ? 'Add Mural' : 'Sign In to Contribute'}
				</a>
			</header>
			<div class="map-panel">
				<div id="murals-map" class="map-frame"></div>
			</div>
			{murals.length ? (
				<ul class="mural-grid">
					{murals.map((mural) => (
						<li class="mural-card" key={String(mural._id)}>
							<a
								class="mural-card-link"
								href={`/murals/${mural._id}`}
								aria-label={`View details for ${mural.title}`}
							>
								<img
									src={heroImage(mural.images[0]?.url)}
									alt={mural.title}
									loading="lazy"
								/>
								<div class="mural-card-body">
									<h2 class="mural-card-title">{mural.title}</h2>
									<p class="meta-row mural-card-meta">
										<span>
											<i class="fa-solid fa-paintbrush" aria-hidden="true"></i>
											{mural.artist}
										</span>
										<span>
											<i class="fa-solid fa-location-dot" aria-hidden="true"></i>
											{mural.location}
										</span>
									</p>
									<p class="mural-card-description">
										{mural.description.length > 140
											? `${mural.description.slice(0, 140)}...`
											: mural.description}
									</p>
									<span class="card-cta">
										View details
										<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
									</span>
								</div>
							</a>
						</li>
					))}
				</ul>
			) : (
				<div class="empty-state">
					<h2>No murals yet</h2>
					<p>Start the collection by adding the first mural.</p>
					<a class="btn btn-primary" href={currentUser ? '/murals/new' : '/register'}>
						{currentUser ? 'Add the first mural' : 'Create an account'}
					</a>
				</div>
			)}
			<script id="map-features" type="application/json">
				{JSON.stringify(mapFeatures)}
			</script>
		</section>
	);
};
