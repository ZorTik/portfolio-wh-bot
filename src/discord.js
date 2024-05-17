const discordApiUrl = 'https://discord.com/api/v10';

export function callApi(endpoint, token, init) {
	if (!token) {
		throw new Error('Missing Discord token');
	}
	return fetch(discordApiUrl + endpoint, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bot ' + token,
			...(init.headers || {}),
		},
	});
}

export async function openChannel(token, recipient) {
	const body = {
		recipient_id: recipient,
	};
	const res = await callApi('/users/@me/channels', token, {
		method: 'POST',
		body: JSON.stringify(body),
	});
	const json = await res.json();
	if (!res.ok) {
		throw new Error(JSON.stringify(json));
	}
	return json.id;
}
