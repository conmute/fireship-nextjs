# User Authentification

## Auth.js Setup

* Create file `app/api/auth/[..nextauth]/route.tsx`
* Create configure the `import type { NextAuthOptions} from 'next-auth'`
* Export this config as  GET and POST from the route.tsx
* Configure necessary Provider_ID and Provider_Secret which you will provide into NextAUthOptions into selected Auth.js provider. Reffer to <https://next-auth.js.org/v3/configuration/providers> docs

Each provider will require you to:

1. Craete an app
1. Copy the key/name/etc values
1. Configure redirects and other necessary config

From 2. step we use it in `.env` file and forward to `NextAuthOptions` with `process.env.<your_env_var>`

There is a ton of examples, most advances is on `cal.com` OpenSource product. See the very rich configuraiton to handle a lot of business value: <https://github.com/calcom/cal.com/blob/main/packages/features/auth/lib/next-auth-options.ts> and is used in the <https://github.com/calcom/cal.com/blob/main/apps/web/pages/api/auth/%5B...nextauth%5D.tsx> file 💪

## Check Auth State

```tsx
// AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

then use this in `<root>/app/layout.tsx` as such:

```tsx
export default function RootLayout({ children }: Props) {
  return (
    <AuthProvider>
        ...
    </AuthProvider>
  )
}
```

Some more component to start from is, for the `client` scripts is:


```tsx
'use client';
import { useSession } from 'next-auth/react'

export default function AuthCheck({ children }: { children: React. ReactNode }) {
    const { data: session, status } = useSession() ;
    console. log(session, status);
    
    if (status === 'authenticated') {
        return <>{children}</>;
    } else {
       return <></>;
    }
}
```

…also to use the `getServerSession` from `next-auth` in `user server` parts to access the current user.

```tsx
import { getServerSession } from 'next-auth';


// …
  const session = await getServerSession();

  if (!session) {
    // redirect or render something else
  }
```

## Signin buttons

```tsx
// authButtons.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export function SignInButton() {
  const { data: session, status } = useSession();
  console.log(session, status);

  if (status === 'loading') {
    return <>...</>;
  }

  if (status === 'authenticated') {
    return (
      <Link href={`/dashboard`}>
        <Image
          src={session.user?.image ?? '/mememan.webp'}
          width={32}
          height={32}
          alt="Your Name"
        />
      </Link>
    );
  }

  return <button onClick={() => signIn()}>Sign in</button>
}

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

## Protected Routes

```tsx
const session = await getServerSession();

  if (!session) {
    redirect('/api/auth/signin');// returns never which means the code after will not be executed
    // OR
    // return <p>You must be signed in...</p>
  }
```

The other way around is to utilize `middleware.ts` as well!

See the docs <https://next-auth.js.org/tutorials/securing-pages-and-api-routes#nextjs-middleware>
