# Security Case Study: Frontend Authentication Bypass via Simulated API Calls

**Author:** Cybersecurity Engineer
**Date:** 2025-11-15
**Severity:** High

---

## 1. Executive Summary

A high-severity authentication bypass vulnerability was discovered in the frontend of the UtopiaHire application. The sign-up and login flows contained placeholder logic that simulated API calls instead of communicating with the backend. This flaw allowed any user to unconditionally bypass authentication and access protected routes, such as the user dashboard and profile completion pages.

## 2. Vulnerability Analysis

The vulnerability was present in the `handleSubmit` functions of both the `src/app/sign-up/page.tsx` and `src/app/login/page.tsx` components. Instead of making a `fetch` request to a backend authentication endpoint, the code implemented a `setTimeout` to create an artificial delay, after which it would programmatically redirect the user.

**Vulnerable Code Snippet (`src/app/sign-up/page.tsx`):**
```typescript
// File: src/app/sign-up/page.tsx, Lines 158-163

const handleSubmit = async (e: React.FormEvent) => {
  // ...
  setIsLoading(true);

  // Simulate API call instead of making a real one
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Unconditionally redirect to a protected route
  router.push("/complete-profile");
};
```
This client-side logic contains a critical flaw: it assumes a successful authentication without ever verifying credentials with a trusted backend. The application's security model was entirely client-side, which is inherently insecure. Further investigation confirmed the absence of any server-side route protection, such as a `middleware.ts` file, which would have otherwise mitigated the impact of this flaw.

### Proof-of-Concept (PoC)

Exploiting this vulnerability requires no special tools or knowledge:
1.  Navigate to the application's sign-up page (`/sign-up`).
2.  Enter any text into the required fields to satisfy the form's client-side validation.
3.  Submit the form.
4.  After a one-second delay, the application grants access to the `/complete-profile` page, a route that should only be accessible to authenticated users.

## 3. Impact Assessment

The impact of this vulnerability is significant:

*   **Unauthorized Access:** Any anonymous user can gain access to protected areas of the application, which may contain sensitive features or user data.
*   **Broken Access Control:** The vulnerability represents a complete failure of the application's access control model.
*   **Trust Erosion:** Such a fundamental flaw can severely damage user trust in the platform's ability to protect their data.

This vulnerability is classified as **High (P1)**. While it doesn't lead to a direct compromise of the entire database like the NoSQL injection, it completely breaks the authentication security control.

## 4. Remediation and Prevention

Remediation requires implementing a proper authentication flow that relies on a backend for verification and session management.

**Immediate Fix:**
1.  **Implement Backend Endpoints:** Create secure backend endpoints for user registration and login.
2.  **Real API Calls:** Modify the `handleSubmit` functions in the frontend to make `fetch` or `axios` requests to these new backend endpoints.
3.  **Token-Based Session Management:** Upon successful authentication, the backend must generate a secure, short-lived session token (e.g., a JWT) and return it to the client.
4.  **Server-Side Route Protection:** Implement a `middleware.ts` file in the Next.js application. This middleware must inspect incoming requests for a valid session token and redirect unauthenticated users away from protected routes.

**Long-Term Prevention Strategy:**
*   **Never Trust the Client:** All security decisions, especially authentication and authorization, must be made on the server-side. The client should only be responsible for rendering the UI and forwarding user actions to the server.
*   **Security by Default:** Development workflows should not use placeholder functions for critical security features like authentication.
*   **Penetration Testing:** Regular security audits and penetration tests should be conducted to identify such architectural flaws before they reach production.

## 5. Conclusion

This case study is a stark reminder that client-side code cannot be trusted to enforce security. Authentication is a security-critical process that must be handled by a trusted backend. The presence of simulated API calls in production code indicates a significant gap in the development and security review process, which must be addressed to prevent similar vulnerabilities in the future.
