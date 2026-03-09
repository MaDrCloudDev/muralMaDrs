import type { FC } from 'hono/jsx';

import type { UserDocument } from '../../models/user.js';

interface HomePageProps {
	currentUser: UserDocument | null;
}

export const HomePage: FC<HomePageProps> = ({ currentUser }) => (
	<section class="hero">
		<p class="hero-eyebrow">Community-led mural directory</p>
		<h1>
			Street art worth the detour.
			<span>Find it, share it, review it.</span>
		</h1>
		<p class="hero-copy">
			muralMaDrs helps locals and travelers track the best murals in any city with photos,
			reviews, and map-first discovery.
		</p>
		<div class="hero-actions">
			<a class="btn btn-primary" href="/murals">
				Explore Murals
			</a>
			{currentUser ? (
				<a class="btn btn-secondary" href="/murals/new">
					Share a Mural
				</a>
			) : (
				<a class="btn btn-secondary" href="/register">
					Create Account
				</a>
			)}
		</div>
		<div class="hero-metrics" aria-label="platform highlights">
			<article>
				<strong>Map-first browsing</strong>
				<p>Zoom into neighborhoods to surface nearby murals.</p>
			</article>
			<article>
				<strong>Fast submissions</strong>
				<p>Upload images, location, and artist details in minutes.</p>
			</article>
			<article>
				<strong>Signal over noise</strong>
				<p>Ratings and review notes help find quality murals quickly.</p>
			</article>
		</div>
	</section>
);
