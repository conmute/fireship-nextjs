# Intro

1st lesson from the course <https://fireship.io/courses/nextjs/basics-next-100s/>

## Special Files

- page.tsx: A file used to define the unique Ul of a route. Pages represent the leaf of the route and are needed for the path to be accessible.

- layout.tsx: A file used to define UI that is shared across multiple pages. A layout accepts another layout or a page as its child. You can nest layouts to create nested routes.

- loading.tsx: An optional file used to create loading UI for a specific part of an app. It automatically wraps a page or child layout in a React Suspense Boundary, showing your loading component immediately on the first load and when navigating between sibling routes.

- error.tsx: An optional file used to isolate errors to specific parts of an app, show specific error information, and functionality to attempt to recover from the error. It automatically wraps a page or child layout in a React Error Boundary. Showing your error component whenever an error in a subtree is caught.

- template.ts: An optional file, similar to layouts, but on navigation, a new instance of the component is mounted and the state is not shared. You can use templates for cases where you require this behavior, such as enter/exit animations.

- head.tsx: An optional file used to define the contents of the «head> tag for a given route.
