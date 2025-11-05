import { Metadata } from "next";

const TITLE = "Mint - FlipFlopBet";
const DESCRIPTION =
  "FlipFlopBet is the first onchain casino built on the x402 protocol. It's easy to play, and you can win or lose USDC.";

const PREVIEW_IMAGE_URL =
  "https://res.cloudinary.com/dlu7jj0qk/image/upload/v1761830855/cat-banner_nrfntq.webp";
const ALT_TITLE = "FlipFlopBet";
const BASE_URL = "https://flipflopbet.com";

export const siteConfig: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: "https://res.cloudinary.com/dlu7jj0qk/image/upload/v1761738186/cat-pfp-removebg-preview_vdesnb.png",
  },
  applicationName: "FlipFlopBet",
  creator: "@flipflopbet",
  twitter: {
    creator: "@flipflopbet",
    title: TITLE,
    description: DESCRIPTION,
    card: "summary_large_image",
    images: [
      {
        url: PREVIEW_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: ALT_TITLE,
      },
    ],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "FlipFlopBet",
    url: BASE_URL,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: PREVIEW_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: ALT_TITLE,
      },
    ],
  },
  category: "Casino",
  alternates: {
    canonical: BASE_URL,
  },
  keywords: [
    "FlipFlopBet",
    "NFTs",
    "gambling",
    "casino",
    "x402",
    "blockchain",
    "web3",
    "coinflip",
    "flip",
    "game",
    "USDC",
  ],
  metadataBase: new URL(BASE_URL),
};
