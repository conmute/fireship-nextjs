# Build an app

## Project Setup and Organization

From my points, first refer to: <https://nextjs.org/docs/getting-started/project-structure>
opinionated structure of Nextjs

---

For fonts the nextjs has fonts handling

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  variable: '--font-inter',
})

// …

<main className={inter.variable}>
</main>
```

where somewhere in project:

```css
.text {
  font-family: var(--font-inter);
  font-weight: 200;
  font-style: italic;
}
```

---

Also recomended to install [React Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

## Navigation

…is a first things to be liked to do

1. Where do we put UI components?
   
   we can put in `<root>/components` or if used onces we can "colocate" where it is used once, as Next App Router allows.

   Used `import Link from "next/link"` for Next route navigation and `import Image from "next/image"` for logos

2. Server OR client component?

   If SEO is a must and component is not needed, `use server` mostly and for clients only parts where interactivity is needed. Opt in for server by default and `use client` when necessary in very granular level

## Static pages

To enable this we need to use `export cosnt dynamic = 'force-statis';` in the `*/page.tsx` and also use `export const metadata` or `export const generateMetadata()…` to have some stuff in the `<head>` of your static page

## API routes

ALl this can be placed under `<root>/app/api/**/*/route.ts`. @see: <./app/src/app/json/route.tsx>

## SSR / Dynamic Routes

To handle dynamic routes with `app/**/*/[propertyName]/page.tsx` with:

```tsx

// to force rendering each time
export const dynamic = "force-dynamic"

// OR

// revalidate it every 10 sec
export const revalidate = 10

// …generic type example
interface Post {
    title: string;
    content: string;
    slug: string
}

interface Props {
    params: {
        propertyName: string
    }
}

export default async function ExamplePage({ params }: Props) {
    // … handle params
    // OR

    // to control the cachin in terms of await functions
    const posts: Post[] = await fetch('http://localhost:3000/api/content', {
        cache: "no-store" // to never cache or always with "force-cache"
    })
        .then((res) => res.json());
    // `!` at the end is non-null assertion so TS knows its non-null, but…
    // better to write actual checkers
    const post = posts.find( (post) =› post.slug === params.slug)!;
    return (<div><h1>{post.title}</h1></div>)
}
```

## Static Generation

`export async function generateStaticParams()` can tell nextjs which list of params are available to render given `page.tsx`

But better to do regular Server Side Generation but with `export const revalidate = 420` to utilise Incremental Static re-Generation which brings the best from two worlds
