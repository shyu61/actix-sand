type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ErrorResult = {
  response: {
    code: number;
  }
}

export async function request<RES>({
  method,
  path,
  body
}: {
  method: Method;
  path: string;
  body?: FormData;
}): Promise<RES> {
  const headers = new Headers({
    Accept: 'application/json',
    ...(body !== undefined ? {} : { 'ContentType': 'application/json' }),
  });

  const res = await fetch(path, {
    method,
    headers,
    ...(body !== undefined ? { body }: {}),
  }).catch(e => {
    console.error(e);
    // eslint-disable-next-line no-throw-literal
    throw { response: { code: 0 } } as ErrorResult;
  })

  return res.json();
}
