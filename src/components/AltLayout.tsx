import Head from 'next/head'
import AltHeader from './AltHeader'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <Head>
            <title>FireBridge</title>
        </Head>
        <style jsx global>{`
            *,
            *::before,
            *::after {
            box-sizing: border-box;
            }
            body {
            margin: 0;
            color: #333;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                'Helvetica Neue', Arial, Noto Sans, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
            }
            .container {
            max-width: 90rem;
            margin: 1.5rem auto;
            padding-left: 1rem;
            padding-right: 1rem;
            }
        `}</style>
        <AltHeader />
        <main>
            <div className="container">{children}</div>
        </main>
    </>
  )
}