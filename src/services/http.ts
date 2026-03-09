export function getStringField(
	value: unknown,
	fallback = ''
): string {
	if (typeof value === 'string') {
		return value;
	}

	if (Array.isArray(value) && typeof value[0] === 'string') {
		return value[0];
	}

	return fallback;
}

export function getStringArray(value: unknown): string[] {
	if (typeof value === 'string') {
		return [value];
	}

	if (Array.isArray(value)) {
		return value.filter((entry): entry is string => typeof entry === 'string');
	}

	return [];
}

export function isSafeReturnTo(value: string | undefined): value is string {
	if (!value) {
		return false;
	}

	return value.startsWith('/') && !value.startsWith('//');
}
