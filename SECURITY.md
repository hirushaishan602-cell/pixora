# Security notes

## Secrets
- Never commit `.env.local`, Firebase Admin service-account JSON, private keys, API tokens, or Cloudinary API secrets.
- The repository intentionally contains no Firebase Admin private key. Configure `FIREBASE_ADMIN_*` only in deployment secrets/environment variables.
- If a Firebase Admin private key was ever committed or shared, revoke/delete that service-account key in Firebase/Google Cloud and generate a new one immediately.

## Firebase
- Keep Firestore and Storage rules deployed from the reviewed rules files.
- Keep admin credentials server-side only.
- Do not put `FIREBASE_ADMIN_*` variables in `NEXT_PUBLIC_*`.

## Cloudinary
- Unsigned upload presets are public by design and can be abused if unrestricted. Configure the preset with strict allowed formats, size/transformation limits, and folder restrictions. For stronger protection, move uploads to a signed server-side endpoint.

## GitHub
Enable secret scanning/push protection and Dependabot on the repository. If any secret appears in Git history, rotate it; deleting the file alone does not make the secret safe.
