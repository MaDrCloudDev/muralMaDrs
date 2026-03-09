import type { FC } from 'hono/jsx';

export const RegisterPage: FC = () => (
	<section class="auth-shell">
		<div class="auth-card">
			<header>
				<p>Join the network</p>
				<h1>Create your account</h1>
			</header>
			<form class="form-grid" action="/register" method="post" novalidate data-validated-form>
				<label>
					<span>Username</span>
					<input type="text" name="username" autoComplete="username" required minLength={3} />
				</label>
				<label>
					<span>Email</span>
					<input type="email" name="email" autoComplete="email" required />
				</label>
				<label>
					<span>Password</span>
					<div class="password-field">
						<input
							type="password"
							name="password"
							autoComplete="new-password"
							required
							minLength={8}
							id="register-password"
						/>
						<button type="button" data-toggle-password="register-password">
							Show
						</button>
					</div>
				</label>
				<button class="btn btn-primary" type="submit" data-submit-button>
					<span data-submit-text>Create Account</span>
					<span data-submit-loading hidden>Creating account...</span>
				</button>
			</form>
			<footer>
				<p>
					Already registered? <a href="/login">Sign in</a>
				</p>
			</footer>
		</div>
	</section>
);
