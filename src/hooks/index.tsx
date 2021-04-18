type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ErrorResult = {
  response: {
    status: number;
  }
}

export async function request<RES>({
  method,
  path,
  body,
  customHeaders
}: {
  method: Method;
  path: string;
  body?: any; // rustサーバーに対してはformDataを使用しない
  customHeaders?: Headers;
}): Promise<RES> {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });
  if (customHeaders !== undefined) {
    for (const pair of customHeaders.entries()) {
      headers.set(pair[0], pair[1]);
    }
  }

  const res = await fetch(path, {
    method,
    headers,
    ...(body !== undefined ? { body }: {}),
  }).catch(e => {
    console.error(e);
    // eslint-disable-next-line no-throw-literal
    throw { response: { status: 0 } } as ErrorResult;
  })

  const parsedText = await res.text();
  return parsedText ? JSON.parse(parsedText) : parsedText
}
