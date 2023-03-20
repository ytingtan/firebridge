import { createGetInitialProps } from '@mantine/next';
import Document, { Head, Html, Main, NextScript } from 'next/document';

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head />
        {/* Cloudflare Web Analytics */}<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "d27d647abd914b2c809ca9c6aa02df03"}'></script>{/* End Cloudflare Web Analytics */}
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}