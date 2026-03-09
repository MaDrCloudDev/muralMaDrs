import type { FC } from 'hono/jsx';

interface ErrorPageProps {
	statusCode: number;
	message: string;
	details?: string;
}

export const ErrorPage: FC<ErrorPageProps> = ({ statusCode, message, details }) => (
	<section class="error-shell">
		<p class="eyebrow">Error {statusCode}</p>
		<h1>{message}</h1>
		{details ? <pre>{details}</pre> : null}
		<a class="btn btn-primary" href="/murals">
			Back to murals
		</a>
	</section>
);
