export default {
  providers: [
    {
      // Configure with your Clerk issuer domain
      // This will be set via environment variable CLERK_JWT_ISSUER_DOMAIN
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
