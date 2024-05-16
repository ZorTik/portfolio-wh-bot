const discordApiUrl = 'https://discord.com/api/v10';

export function callApi(endpoint, token, init) {
	if (!env.DISCORD_TOKEN) {
		throw new Error('Missing Discord token');
	}
	return fetch(discordApiUrl + endpoint, {
		...init,
		headers: {
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
	})
		.then(res => res.json());
	return res.id;
}
