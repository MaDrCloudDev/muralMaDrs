import type { FC } from 'hono/jsx';

import type { UserDocument } from '../../models/user';

interface NavProps {
	currentPath: string;
	currentUser: UserDocument | null;
}

function isActive(currentPath: string, route: string): string {
	if (route === '/murals') {
		// Keep Explore active on gallery and detail routes, but not on create/edit actions.
		return currentPath === '/murals' || /^\/murals\/[a-f0-9]{24}$/i.test(currentPath)
			? 'is-active'
			: '';
	}

	if (route === '/murals/new') {
		return currentPath === '/murals/new' ? 'is-active' : '';
	}

	return currentPath === route ? 'is-active' : '';
}

export const Nav: FC<NavProps> = ({ currentPath, currentUser }) => (
	<nav class="site-nav">
		<div class="shell nav-shell">
			<a class="brand" href="/">
				<span>mural</span>
				<strong>MaDrs</strong>
			</a>
			<button
				type="button"
				class="nav-toggle"
				data-nav-toggle
				aria-expanded="false"
				aria-controls="site-menu"
			>
				Menu
			</button>
			<div class="nav-menu" id="site-menu" data-nav-menu>
				<a class={isActive(currentPath, '/murals')} href="/murals">
					Explore
				</a>
				{currentUser ? (
					<>
						<a class={isActive(currentPath, '/murals/new')} href="/murals/new">
							Add Mural
						</a>
						<form action="/logout" method="post">
							<button type="submit" class="ghost-link">
								Logout
							</button>
						</form>
					</>
				) : (
					<>
						<a class={isActive(currentPath, '/login')} href="/login">
							Login
						</a>
						<a class="btn btn-nav" href="/register">
							Create Account
						</a>
					</>
				)}
			</div>
		</div>
	</nav>
);
