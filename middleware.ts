import { next } from "@vercel/edge";
import { ipAddress } from "@vercel/functions";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: `https://${process.env.X_UPSTASH_ENDPOINT}`,
    token: process.env.X_UPSTASH_REST_TOKEN,
  }),
  prefix: "ratelimit_",
  analytics: true,
  // 900 requests from the same IP in 900 seconds
  limiter: Ratelimit.slidingWindow(900, "900 s"),
});

// Define which routes you want to rate limit
export const config = {
  matcher: "/",
};

export default async function middleware(request: Request) {
  // You could alternatively limit based on user ID or similar
  const ip = ipAddress(request) || "127.0.0.1";
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    ip,
  );

  if (success) {
    return next();
  }

  return Response.redirect(new URL("/blocked.html", request.url));
}
