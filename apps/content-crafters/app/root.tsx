import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { LinksFunction } from '@remix-run/node';
import { Theme } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import { ReactFlowProvider } from '@xyflow/react';
import './styles/main.scss';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Content Crafters</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Theme grayColor="gray" panelBackground="solid" appearance={'inherit'} radius="large" scaling="95%">
          <ReactFlowProvider>
            {children}
            <ScrollRestoration />
            <Scripts />
            <Toaster richColors />
          </ReactFlowProvider>
        </Theme>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
