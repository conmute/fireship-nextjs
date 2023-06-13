# Data Fetching

## Database Setup

…author uses `https://neon.tech` which is well integrated with Vercel, after setup we can use it in:

```sh
# .env

# Example
# postgres://USERNAME:PASSWORD@ep-foo-bar.us-east-2.aws.neon.tech/main
DATABASE_URL=postgres://...
SHADOW_DATABASE_URL=postgres://...
```

Two databases needed:

- main
- shadow (for prisma installments…)

The same defines supabase or etc with similar configuratins. Yet with supabase we can leverage PostgREST to utilise it better on client side bypassing nodejs runtime (per table row policy)

## Prisma Setup

For prisma, if followed in NextJS utilize the prisma-adaptes with follow these steps as described in given documetation <https://authjs.dev/reference/adapter/prisma>

some steps:

```sh
npx prisma init
npx prisma migrate dev
```

Here should be enough steps to work with schema

```
// prisma.schema
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Only needed when using a cloud provider that doesn't support the creation of new databases, like Neon. Learn more: https://pris.ly/d/migrate-shadow
}

// NextAuth Schema

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  refresh_token_expires_in Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  bio           String? @db.Text
  age           Int?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Auth Data Store

part of the same docs <https://authjs.dev/reference/adapter/prisma>

```sh
npm install @prisma/client @next-auth/prisma-adapter
```

and in config to have such as this:

```ts
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {

  adapter: PrismaAdapter(prisma),
    //  ...
}
```

where `@/lib/prisma` is:

```ts
// <root>/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

## API Route Fetching

with prisma it would be smth like this:

```tsx
// route.tsx
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const users = await prisma.user.findMany();
  console.log(users);

  return NextResponse.json(users);
}
```

## Server Component Fetching

with prisma it would be smth like this:

```tsx
// page.tsx
import UserCard from '@/components/UserCard/UserCard';
import styles from './page.module.css';
import { prisma } from '@/lib/prisma';

export default async function Users() {
  const users = await prisma.user.findMany();

  return (
    <div className={styles.grid}>
      {users.map((user) => {
        return <UserCard key={user.id} {...user} />;
      })}
    </div>
  );
}
```

where `UserCard` is

```tsx
// UserCard.tsx
import Link from 'next/link';
import styles from './UserCard.module.css';

interface Props {
  id: string;
  name: string | null;
  age: number | null;
  image: string | null;
}

export default function UserCard({ id, name, age, image }: Props) {
  return (
    <div className={styles.card}>
      <img
        src={image ?? '/mememan.webp'}
        alt={`${name}'s profile`}
        className={styles.cardImage}
      />
      <div className={styles.cardContent}>
        <h3>
          <Link href={`/users/${id}`}>{name}</Link>
        </h3>
        <p>Age: {age}</p>
      </div>
    </div>
  );
```

## Dynamic Route Data

Example of a dynamic page with dynamc data under the dynamic route…

```tsx
// user/[id]/page.tsx
import FollowButton from '@/components/FollowButton/FollowButton';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  return { title: `User profile of ${user?.name}` };
}

export default async function UserProfile({ params }: Props) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  const { name, bio, image, id } = user ?? {};

  return (
    <div>
      <h1>{name}</h1>

      <img
        width={300}
        src={image ?? '/mememan.webp'}
        alt={`${name}'s profile`}
      />

      <h3>Bio</h3>
      <p>{bio}</p>

    </div>
  );
}
```

## Loading UI

simple the file…

```ts
// loading.tsx near the page.tsx
export default async function LoadingUsers() {
  return <div>Loading user data...</div>;
}
```

and it will apply given Loader to current level and to children bellow

## Error UI

```tsx
'use client'; // Error components must be Client components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

this error content will be shown in any case, but in development mode it will also display stack trace details
