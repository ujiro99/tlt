export function getHeader(token: string) {
  return {
    method: 'GET',
    async: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    contentType: 'json',
  }
}
