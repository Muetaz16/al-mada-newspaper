const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'al-mada-newspaper-secret-session-key-must-be-long-and-secure'
);

/**
 * Encodes an object to a URL-safe Base64 string (no padding).
 */
function base64UrlEncode(obj: any): string {
  const jsonStr = JSON.stringify(obj);
  // Support utf-8 encoding safely in all runtimes
  const bytes = new TextEncoder().encode(jsonStr);
  const binString = Array.from(bytes, (x) => String.fromCharCode(x)).join('');
  return btoa(binString)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decodes a URL-safe Base64 string back to an object.
 */
function base64UrlDecode(str: string): any {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
  const jsonStr = new TextDecoder().decode(bytes);
  return JSON.parse(jsonStr);
}

/**
 * Signs a payload and returns a JSON Web Token (JWT).
 */
export async function signJWT(payload: any, expiresInSeconds: number = 60 * 60 * 24 * 7): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode({ ...payload, exp });
  
  const key = await crypto.subtle.importKey(
    'raw',
    JWT_SECRET,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureInput = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = await crypto.subtle.sign('HMAC', key, signatureInput);
  
  const signatureBytes = new Uint8Array(signature);
  const binString = Array.from(signatureBytes, (x) => String.fromCharCode(x)).join('');
  const encodedSignature = btoa(binString)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a JWT and returns the parsed payload, or null if invalid or expired.
 */
export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    const key = await crypto.subtle.importKey(
      'raw',
      JWT_SECRET,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // Convert signature back to Uint8Array
    let base64Sig = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) {
      base64Sig += '=';
    }
    const binString = atob(base64Sig);
    const signatureBytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    
    const signatureInput = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, signatureInput);
    
    if (!isValid) return null;
    
    const payload = base64UrlDecode(encodedPayload);
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
