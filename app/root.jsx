import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration,Link } from "@remix-run/react";
import "./tailwind.css";

export const meta = () => {
  return [
    { title: "Form Builder" },
    { name: "description", content: "A modern, feature-rich form builder application" }
  ];
};

export const links = () => [
  { rel: "stylesheet", href: "/app/tailwind.css" },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="flex gap-4 p-4 border-b bg-gray-100">
  <Link to="/">Home</Link>
  <Link to="/login">Login</Link>
  <Link to="/register">Register</Link>
  <Link to="/dashboard">Dashboard</Link>
</nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
