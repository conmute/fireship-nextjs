# Advanced

Some caveats and advanced parts…

## Form Submission

Given from to be used under protected `page.tsx`, whic will redirect the unauthorised users to login

```tsx
'use client';

export function ProfileForm({ user }: any) {

  const updateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);

    const body = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      age: formData.get('age'),
      image: formData.get('image'),
    };

    const res = await fetch('/api/user', {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    await res.json();
  };

  return (
    <div>
      <h2>Edit Your Profile</h2>
      <form onSubmit={updateUser}>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" defaultValue={user?.name ?? ''} />
        <label htmlFor="bio">Bio</label>
        <textarea
          name="bio"
          cols={30}
          rows={10}
          defaultValue={user?.bio ?? ''}
        ></textarea>
        <label htmlFor="age">Age</label>
        <input type="text" name="age" defaultValue={user?.age ?? 0} />
        <label htmlFor="image">Profile Image URL</label>
        <input type="text" name="image" defaultValue={user?.image ?? ''} />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
```

The form modified the profile. To handle update we could write similar to this:

```tsx
import { prisma } from "@/lib/prisma"
import { authoptions } from "../auth/[...nextauth]/route"

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    const currentUserEmail = session?.user?.email!;

    const data = await req.json();
    data.age = Number(data.age);

    const user = await prisma.user.update({
        where: {
            email: currentUserEmail,
        }
    });
    return NextResponse.json(user)
}
```

## Follower System

an API handler example for form above

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';


export async function POST(req: Request) {
  const session = await getServerSession();
  const currentUserEmail = session?.user?.email!;
  const { targetUserId } = await req.json();

  const currentUserId = await prisma.user
    .findUnique({ where: { email: currentUserEmail } })
    .then((user) => user?.id!);

  const record = await prisma.follows.create({
    data: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest) {
  
  const session = await getServerSession();
  const currentUserEmail = session?.user?.email!;
  const targetUserId = req.nextUrl.searchParams.get('targetUserId');

  const currentUserId = await prisma.user
    .findUnique({ where: { email: currentUserEmail } })
    .then((user) => user?.id!);

  const record = await prisma.follows.delete({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId!,
      },
    },
  });

  return NextResponse.json(record);
}
```

it lacks validation of the data, which is done the best with the `zod.js` library <https://github.com/colinhacks/zod>

---

To enable the followin we need to update schema as well:

```schema
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
  followedBy    Follows[] @relation("following")
  following     Follows[] @relation("follower")
}

model Follows {
  follower    User @relation("follower", fields: [followerId], references: [id])
  followerId  String
  following   User @relation("following", fields: [followingId], references: [id])
  followingId String

  @@id([followerId, followingId])
}
```

and after we can do similar things as `npx prisma migrate dev`

## Clinet Mutation for Follow/Unfollow button

```tsx
// FollowButton.tsx
'use server'
import { getServerSession } from 'next-auth';
import FollowClient from './FollowClient';
import { prisma } from '@/lib/prisma';

interface Props {
  targetUserId: string;
}

export default async function FollowButton({ targetUserId }: Props) {
  const session = await getServerSession();

  const currentUserId = await prisma.user
    .findUnique({ where: { email: session?.user?.email! } })
    .then((user) => user?.id!);

  const isFollowing = await prisma.follows.findFirst({
    where: { followerId: currentUserId, followingId: targetUserId },
  });

  return (
    <FollowClient targetUserId={targetUserId} isFollowing={!!isFollowing} />
  );
}
```

```tsx
// FollowButtonClient.tsx
"use client"
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface Props { 
    targetUserId: string;
    isFollowing: boolean;
}

export default function FollowClient({ targetUserId, isFollowing }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isFetching, setIsFetching] = useState(false);
    const isMutating = isFetching || isPending;

    const follow = async () => {
        setIsFetching(true);

        const res = await fetch('/api/follow', {
            method: 'POST',
            body: JSON.stringify({ targetUserId }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        setIsFetching(false);

        console.log(res)

        startTransition(() => {
            // Refresh the current route:
            // - Makes a new request to the server for the route
            // - Re-fetches data requests and re-renders Server Components
            // - Sends the updated React Server Component payload to the client
            // - The client merges the payload without losing unaffected
            //   client-side React state or browser state
            router.refresh();
          });
    }

    
    const unfollow = async () => {
        setIsFetching(true);

        const res = await fetch(`/api/follow?targetUserId=${targetUserId}`, {
            method: 'DELETE',
        });

        setIsFetching(false);
        startTransition(() =>  router.refresh() );
    }

    if (isFollowing) {
        return (
            <button onClick={unfollow}>
                {!isMutating ? 'Unfollow' : '...'}
            </button>
        )

    } else {
        return (
            <button onClick={follow}>
                {!isMutating ? 'Follow' : '...'}
            </button>
        )
    }

}
```

the `router.refresh()` forces to refresh data on the full page, so maybe would be better to have the `FollowButton.tsx` as `"use client"` so we can not force the `router.refresh()` which reloads the page context

## Server actions

to OPT-IN do the config update similar to:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

```tsx
// dogs/[id]/edit/page.tsx
import kv from "@vercel/kv";
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache";

interface Dog {
  name: string;
  image: string;
  breed: string;
}

export default async function DogEditPage({
  params,
}: {
  params: { id: string };
}) {

  // Fetch data
  const key = `dogs:${params.id}`;
  const dog = await kv.get<Dog>(key);

  async function upDog(formData: FormData) {
    "use server";

    // Mutate data
    await kv.set(key, {
      name: formData.get("title"),
      image: formData.get("image"),
      breed: formData.get("breed"),
    });

    // Revalidate
    revalidatePath(`/dogs/${params.id}/edit`);
  }

  async function upDogDeuce(formData: FormData) {
    "use server";
    await kv.set(key, {
        name: formData.get("title"),
        image: formData.get("image"),
        breed: formData.get("breed"),
    });
    redirect(`/dogs/${params.id}`)
  }

  return (
      <div className={styles.cardBody}>
        <h2>Edit {dog?.name}</h2>

        <form action={upDog}>
          <label>Name</label>
          <input name="title" type="text" defaultValue={dog?.name} />
          <label>Image</label>
          <input name="image" type="text" defaultValue={dog?.image} />
          <label>Breed</label>
          <input name="breed" type="text" defaultValue={dog?.breed} />
          <button type="submit" onClick={upDogDeuce}>Save and Continue</button>

        </form>
      </div>
  );
}
```

```tsx
// loading.tsx
import styles from "./page.module.scss";

export default function Loading() {
  return (
    <div className={styles.card}>
      <div className={`${styles.cardImg} ${styles.skeleton}`}></div>
      <div className={styles.cardBody}>
        <h2 className={`${styles.cardTitle} ${styles.skeleton}`}></h2>
        <p className={`${styles.cardIntro} ${styles.skeleton}`}></p>
      </div>
    </div>
  );
}
```

```css
/* page.module.scss */
.card {
	display: flex;
	flex-direction: column;
	flex-basis: 300px;
	flex-shrink: 0;
	flex-grow: 0;
	max-width: 100%;
	background-color: #FFF;
	box-shadow: 0 5px 10px 0 rgba(#000, .15);
	border-radius: 10px;
	overflow: hidden;
	margin: 1rem;
	max-width: 300px;
}

.cardImg {
	aspect-ratio: 16/9;
	position: relative;
	overflow: hidden;
	img {
		position: absolute;
		width: 100%;
	}
}

.cardBody {
	padding: 1.5rem;
}

.cardTitle {
	font-size: 1.25rem;
	line-height: 1.33;
	font-weight: 700;
	&.skeleton { 
		min-height: 28px;
		border-radius: 4px;
	}
}

.cardIntro {
	margin-top: .75rem;
	line-height: 1.5;
	&.skeleton { 
		min-height: 72px;
		border-radius: 4px;
	}
}

/* // THE LOADING EFFECT */
.skeleton {
	background-color: #e2e5e7;
	background-image:			
			linear-gradient(
				90deg, 
				rgba(#fff, 0), 
				rgba(#fff, 0.5),
				rgba(#fff, 0)
			);
	background-size: 40px 100%; 
	background-repeat: no-repeat; 
	background-position: left -40px top 0; 
	animation: shine 1s ease infinite; 
}

@keyframes shine {
	to {
		background-position: right -40px top 0;
	}
}
```

lot of this parts are part of the <https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#enhancements>

The server actions recude the need of `useEffect` in the code due to link to the server data state!
