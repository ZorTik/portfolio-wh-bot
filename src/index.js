import handleMessageCreated from './event/messageNotify.js';

async function verifyRequest(env, token, integrity_token_incoming) {
	const { valid, integrity_token } = await fetch(
		(env.PORTFOLIO_URL ?? 'https://zortik.vercel.app') + '/api/webhooks/verify?code=' + token, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then((res) => res.json());
	if (integrity_token !== integrity_token_incoming) {
		console.log('Integrity tokens mismatch', {
			integrity_token,
			integrity_token_incoming,
		});
		return false;
	} else {
		console.log('Integrity tokens match');
	}
	return valid === true;
}

async function cfFetch(req, env, ctx) {
	if (req.method.toLowerCase() === 'post') {
		const body = await new Response(req.body).json();
		if (!await verifyRequest(env, body['verify_token'], body['integrity_token'])) {
			return Response.json({
				code: 401,
				message: 'Invalid token',
			}, {
				status: 401,
			});
		}
		if (body.type) {
			let res = undefined;
			switch (body.type) {
				case 'chat.messages.created':
					res = await handleMessageCreated(req, env, body.payload);
					break;
				default:
					throw new Error('Invalid event ' + body.type);
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
}

export default {
	fetch: cfFetch,
};
