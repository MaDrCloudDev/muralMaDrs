import type { FC } from 'hono/jsx';

interface LoginPageProps {
	returnTo?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ returnTo }) => (
	<section class="auth-shell">
		<div class="auth-card">
			<header>
				<p>Welcome back</p>
				<h1>Sign in</h1>
			</header>
			<form class="form-grid" action="/login" method="post" novalidate data-validated-form>
				{returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
				<label>
					<span>Username</span>
					<input type="text" name="username" autoComplete="username" required />
				</label>
				<label>
					<span>Password</span>
					<div class="password-field">
						<input
							type="password"
							name="password"
							autoComplete="current-password"
							required
							id="login-password"
						/>
						<button type="button" data-toggle-password="login-password">
							Show
						</button>
					</div>
				</label>
				<button class="btn btn-primary" type="submit" data-submit-button>
					<span data-submit-text>Sign In</span>
					<span data-submit-loading hidden>Signing in...</span>
				</button>
			</form>
			<footer>
				<p>
					No account yet? <a href="/register">Create one</a>
				</p>
			</footer>
		</div>
	</section>
);
