import { callApi as call, openChannel } from '../discord';

async function notifyEvent(env, channelId, event) {
	const room = event.room;
	const messages = event.messages;
	await call('/channels/' + channelId + '/messages', env.DISCORD_TOKEN, {
		method: 'POST',
		body: JSON.stringify({
			content: 'New messages in ticket #' + room.id + ' (' + room.title + ')',
			embeds: [{
				title: 'Messages',
				fields: [
					{
						name: 'Messages',
						value: messages.map((message) => {
							return message.username + ': ' + message.content;
						}).join('\n'),
					},
				],
			}],
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});
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
	await notifyEvent(env, channelId, event);
	return Response.json({
		code: 200,
		message: 'OK',
	});
}
