import handleMessageCreated from './event/messageNotify.js';

export default {
	async fetch(req, env, ctx) {
		if (req.method.toLowerCase() === 'post') {
			const body = await new Response(req.body).json();
			const { valid } = await fetch(
				'https://zortik.vercel.app/api/webhooks/verify?code=' + body['verify_token'], {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((res) => res.json());
			if (valid !== true) {
				return Response.json({
					code: 401,
					message: 'Invalid token',
				}, {
					status: 401,
				});
			}
			if (body.event) {
				let res = undefined;
				switch (body.event) {
					case 'chat.messages.created':
						res = await handleMessageCreated(req, env, body.event);
						break;
					default:
						throw new Error('Invalid event ' + body.event);
				}
				if (res) {
					return res;
				}
			}
		}
		return Response.json({
			code: 400,
			message: 'Invalid request',
		}, {
			status: 400,
		});
	},
};
