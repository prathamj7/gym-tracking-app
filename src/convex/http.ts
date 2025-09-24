import { httpRouter } from "convex/server";

const http = httpRouter();

// Note: With Clerk authentication, we don't need auth HTTP routes
// Clerk handles authentication on the client side and provides JWT tokens
// that are validated by Convex using the auth.config.ts configuration

export default http;
