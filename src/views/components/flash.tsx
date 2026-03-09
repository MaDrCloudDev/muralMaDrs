import type { FC } from 'hono/jsx';

import type { FlashMessages } from '../../types';

interface FlashProps {
	messages: FlashMessages;
}

const Alert: FC<{ tone: 'success' | 'error'; text: string }> = ({
	tone,
	text,
}) => (
	<div
		class={`alert ${tone === 'success' ? 'alert-success' : 'alert-error'}`}
		role="status"
	>
		<div class="alert-content">
			<strong>{tone === 'success' ? 'Success' : 'Heads up'}</strong>
			<p>{text}</p>
		</div>
		<button type="button" class="alert-close" data-dismiss-alert aria-label="Dismiss">
			×
		</button>
	</div>
);

export const Flash: FC<FlashProps> = ({ messages }) => (
	<div class="flash-stack" aria-live="polite">
		{messages.success.map((message) => (
			<Alert tone="success" text={message} />
		))}
		{messages.error.map((message) => (
			<Alert tone="error" text={message} />
		))}
	</div>
);
