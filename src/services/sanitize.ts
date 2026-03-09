import sanitizeHtml from 'sanitize-html';

export function sanitizeText(value: string): string {
	return sanitizeHtml(value, {
		allowedTags: [],
		allowedAttributes: {},
	})
		.replace(/\s+/g, ' ')
		.trim();
}
