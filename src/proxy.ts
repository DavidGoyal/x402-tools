import { paymentMiddleware, Network } from "x402-next";

const address = process.env.ADDRESS;
const facilitatorUrl = process.env.FACILITATOR_URL;
const network = process.env.NETWORK;

// Configure the payment middleware
export const proxy = paymentMiddleware(
  address as `0x${string}`, // your receiving wallet address
  {
    // Route configurations for protected endpoints
    "/api/v1/uploadToIpfs/single": {
      price: "$1.00",
      network: network as Network,
      config: {
        description: "Upload any file to IPFS",
      },
    },
    "/api/v1/uploadToIpfs/multiple": {
      price: "$1.50",
      network: network as Network,
      config: {
        description: "Upload multiple files to IPFS",
      },
    },
  },
  {
    url: facilitatorUrl as `${string}://${string}`,
  }
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/v1/uploadToIpfs/single", "/api/v1/uploadToIpfs/multiple"],
};
