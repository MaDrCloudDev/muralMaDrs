import type { Child, FC } from 'hono/jsx';

import type { UserDocument } from '../../models/user';
import type { FlashMessages } from '../../types';
import { Flash } from './flash';
import { Footer } from './footer';
import { Nav } from './nav';

interface LayoutProps {
	title: string;
	currentPath: string;
	currentUser: UserDocument | null;
	flash: FlashMessages;
	children: Child;
	includeMapboxAssets?: boolean;
	mapboxToken?: string;
	extraScripts?: string[];
}

export const Layout: FC<LayoutProps> = ({
	title,
	currentPath,
	currentUser,
	flash,
	children,
	includeMapboxAssets = false,
	mapboxToken,
	extraScripts = [],
}) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="description" content="Discover, share, and review street murals." />
			<meta name="mapbox-token" content={mapboxToken ?? ''} />
			<title>{`${title} | muralMaDrs`}</title>
			<link rel="icon" href="/favicon.ico" />
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			<link
				href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap"
				rel="stylesheet"
			/>
			{includeMapboxAssets ? (
				<link
					href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css"
					rel="stylesheet"
				/>
			) : null}
			<link rel="stylesheet" href="/stylesheets/output.css" />
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
				integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
				crossOrigin="anonymous"
				referrerPolicy="no-referrer"
			/>
			{includeMapboxAssets ? (
				<script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>
			) : null}
		</head>
		<body>
			<div class="page-gradient" aria-hidden="true"></div>
			<Nav currentPath={currentPath} currentUser={currentUser} />
			<main class="shell page-content">
				<Flash messages={flash} />
				{children}
			</main>
			<Footer />
			<script type="module" src="/javascripts/app.js"></script>
			{extraScripts.map((script) => (
				<script type="module" src={script}></script>
			))}
		</body>
	</html>
);
