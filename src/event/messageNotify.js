import { callApi as call, openChannel } from '../discord';

async function notifyEvent(env, channelId, event) {
	const room = event.room;
	const messages = event.messages;
	const res = await call('/channels/' + channelId + '/messages', env.DISCORD_TOKEN, {
		method: 'POST',
		body: JSON.stringify({
			content: 'New message in ticket #' + room.id + ' (' + room.title + ')\n> ' + messages.map((message) => {
				return message.username + ': ' + message.content;
			}).join('\n'),
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (res.ok) {
		return Response.json({ code: 200, message: 'OK' });
	} else {
		const message = 'Failed to send discord message. (' + JSON.stringify(await res.json()) + ')';
		console.log(message);
		return Response.json({ code: 500, message }, { status: 500 });
	}
}

export default async function (req, env, event) {
	if (!env.DISCORD_RECIPIENT) {
		return Response.json({
			code: 500,
			message: 'Missing Discord recipient',
		}, {
			status: 500,
		});
	}
	const channelId = await openChannel(env.DISCORD_TOKEN, env.DISCORD_RECIPIENT);
	return await notifyEvent(env, channelId, event);
}
