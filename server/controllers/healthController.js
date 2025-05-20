export async function healthCheck(request, reply) {
  reply.type('application/json');
  return { status: 'ok' };
}
