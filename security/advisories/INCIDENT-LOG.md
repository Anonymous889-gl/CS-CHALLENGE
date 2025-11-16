 # Security Incident Log

**Project:** UtopiaHire - AI Career Architect  
**Maintained By:** Security Team  
**Last Updated:** November 15, 2025

---

## Incident Classification

| Level | Description | Response Time |
|-------|-------------|---------------|
| **CRITICAL** | Active exploitation, data breach | Immediate (1 hour) |
| **HIGH** | High-severity vulnerability | 24 hours |
| **MEDIUM** | Moderate security issue | 1 week |
| **LOW** | Minor security concern | 1 month |

---

## Incident Log Entries

---

### INC-2025-001: Session Cookie Security Vulnerabilities

**Date Discovered:** November 10, 2025  
**Discovered By:**  Semgrep scan  
**Classification:** HIGH  
**Status:** ✅ RESOLVED  

**Description:**  
Six session management vulnerabilities identified:
1. Default session cookie name (fingerprinting risk)
2. Missing httpOnly flag (XSS vulnerability)
3. Missing secure flag (MITM vulnerability)
4. No cookie expiration (session fixation)
5. Missing domain/path restrictions
6. Missing SameSite protection (CSRF)

**Affected Components:**
- Backend/src/server.js (Line 14)

**Impact:**
- Session hijacking via XSS
- CSRF attacks possible
- Man-in-the-Middle interception

**Resolution:**  
Implemented secure session cookie configuration with all recommended security flags.

**Resolution Date:** November 10, 2025  
**Verification:** Semgrep scan passed (0 findings)

---

### INC-2025-002: Missing Input Validation

**Date Discovered:** November 15, 2025  
**Discovered By:** Security Team  
**Classification:** MEDIUM  
**Status:** 🟡 SCHEDULED  

**Description:**  
Signup controller lacks comprehensive input validation and sanitization. User input from request body not validated before database operations.

**Affected Components:**
- Backend/src/controllers/authController.js

**Impact:**
- Data integrity issues
- Potential injection vectors
- Application errors from malformed data

**Response Actions:**
1. GitHub issue created (#5)
2. express-validator integration planned
3. Comprehensive validation rules defined

**Target Resolution:** November 15, 2025  
**Documentation:** GitHub Issue #5

---

### INC-2025-003: Potential XSS in Image Preview

**Date Discovered:** November 15, 2025  
**Discovered By:** Security audit   
**Classification:** LOW  
**Status:** 🟢 SCHEDULED  

**Description:**  
Client-side image preview in signup form could potentially be exploited for XSS if malicious file uploaded. Modern browsers have built-in protections, but additional validation recommended.

**Affected Components:**
- src/app/sign-up/page.tsx

**Impact:**
- Limited client-side code execution risk
- Browser protections provide mitigation



**Target Resolution:** November 15, 2025  
**Documentation:** GitHub Issue #6

---

## Summary Statistics

**Total Incidents:** 3  
**Resolved:** 1  
**In Progress:** 0  
**Scheduled:** 2

**By Severity:**
- High: 1 (resolved)
- Medium: 1 (scheduled)
- Low: 1 (scheduled)

**Average Resolution Time:**
- High: 0 days (same-day resolution)

---


## Related Documentation

- [SECURITY.md](../SECURITY.md) - Main security documentation
- [SECURITY_FINDINGS.md](../reports) - Detailed vulnerability analysis

---

**Next Review:** December 15, 2025

