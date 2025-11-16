# Security Case Study: NoSQL Injection in an Unsanitized Authentication Endpoint

**Author:** Cybersecurity Engineer
**Date:** 2025-11-15
**Severity:** Critical

---

## 1. Executive Summary

A critical NoSQL injection vulnerability was identified in the backend authentication service of the UtopiaHire application. The vulnerability stemmed from the direct use of unsanitized user input within a database query, allowing an attacker to bypass authentication mechanisms and gain unauthorized access to user accounts. This case study provides a technical breakdown of the vulnerability, its potential impact, and the recommended remediation strategy.

## 2. Vulnerability Analysis

The root cause of the vulnerability was located in the `login` function of the `Backend/src/controllers/authController.js` file. The application's code directly destructured the `email` and `password` from the incoming request body and used the `email` variable in a Mongoose `User.findOne()` query without prior sanitization or validation.

**Vulnerable Code Snippet:**
```javascript
// File: Backend/src/controllers/authController.js, Lines 24-25

exports.login = async (req, res) => {
  const { email, password } = req.body; // User input is not sanitized
  const user = await User.findOne({ email }); // Input is used directly in the query
  // ...
};
```

Because Mongoose and many other NoSQL databases interpret special operators (e.g., `$ne`, `$gt`, `$regex`) within query objects, this pattern is highly insecure. An attacker can craft a JSON payload that replaces the expected string value of the `email` field with a query operator object.

### Proof-of-Concept (PoC)

An attacker could send the following HTTP request to the login endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": {"$ne": "null"}, "password": "any"}'
```

The backend would process this as `User.findOne({ email: { $ne: null } })`. This query translates to "find one user where the email is not equal to null," effectively returning the first user found in the database and allowing the attacker to log in as that user, bypassing the password check.

## 3. Impact Assessment

The impact of this vulnerability is severe:

*   **Authentication Bypass:** Attackers can gain unauthorized access to any user's account by bypassing the login mechanism.
*   **Data Exfiltration:** Once logged in, an attacker has access to all the personal and sensitive information associated with the compromised account.
*   **Account Takeover:** An attacker could potentially change the password or email of the compromised account, leading to a full account takeover.

Given the ease of exploitation and the high potential for damage, this vulnerability is classified as **Critical (P0)**.

## 4. Remediation and Prevention

The immediate remediation is to introduce a sanitization layer that strips malicious operators from user input before it reaches the database query.

**Immediate Fix:**
1.  **Install `express-mongo-sanitize`:**
    ```bash
    npm install express-mongo-sanitize
    ```
2.  **Apply as Middleware:** The middleware should be applied globally in the main server file (`server.js`).
    ```javascript
    const mongoSanitize = require('express-mongo-sanitize');
    app.use(mongoSanitize());
    ```

**Long-Term Prevention Strategy:**
*   **Never Trust User Input:** Treat all data from clients, third-party APIs, and even other internal services as untrusted.
*   **Defense-in-Depth:** In addition to sanitization, implement schema validation (e.g., using `express-validator` or `Joi`) to ensure that incoming data conforms to the expected format (e.g., a valid email string).
*   **Security Awareness Training:** Educate developers on common vulnerabilities like injection attacks and the importance of secure coding practices.

## 5. Conclusion

This case study highlights a classic, yet critical, security flaw. It underscores the absolute necessity of sanitizing and validating all user-controlled input before it is used in security-sensitive operations like database queries. Relying on client-side validation alone is insufficient; robust server-side controls are non-negotiable for protecting against injection attacks.
