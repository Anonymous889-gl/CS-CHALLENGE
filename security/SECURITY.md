# UtopiaHire Platform Security Policy

**Version:** 1.1  
**Last Updated:** 2025-11-15

 

This document outlines the target security architecture and policies for the UtopiaHire platform, designed for the IEEE tsyp13 Challenge. While the core security principles are being implemented, this is a demonstration project. Some of the controls and procedures described herein are still under active development and have not been fully deployed or hardened. This platform should not be considered production-ready at this phase.

---

## 1. Executive Overview

UtopiaHire is an AI-powered career development platform serving job seekers across **Sub-Saharan Africa and the MENA region**. This security policy establishes a comprehensive framework built on **security by design** principles to protect the confidentiality, integrity, and availability of the platform and user data.

### 1.1 Security Philosophy

Our security program is anchored in:

- **Privacy by Design:** User data minimization and purpose limitation from inception
- **Transparency:** Clear communication about data handling practices and security controls
- **Regional Compliance:** Adherence to emerging market data protection frameworks
- **Ethical AI:** Commitment to fairness, bias mitigation, and responsible AI deployment
- **Proactive Threat Management:** Continuous vulnerability assessment and remediation

This policy applies to all software, infrastructure, systems, and personnel involved in the development, deployment, and maintenance of UtopiaHire.

---

## 2. Regional Context & Compliance Framework

### 2.1 MENA Region Considerations

The Middle East and North Africa region presents unique security and compliance requirements:

- **Varying Data Protection Maturity:** Countries across MENA have different levels of digital infrastructure and data protection standards
- **Cultural and Legal Diversity:** Privacy expectations and legal frameworks differ significantly across jurisdictions
- **Digital Transformation Initiatives:** Rapid adoption of digital services requiring robust security foundations
- **Evolving Cybersecurity Regulations:** Increasing regulatory focus on data protection and cybersecurity standards
- **Localization Requirements:** Some jurisdictions mandate data residency or local processing

### 2.2 Sub-Saharan Africa Considerations

- **Infrastructure Variability:** Security controls must account for diverse network conditions and connectivity patterns
- **Resource Constraints:** Efficient, lightweight security implementations for lower-bandwidth environments
- **Regulatory Evolution:** Progressive adoption of data protection laws (e.g., Nigeria's NDPR, Kenya's PDPA)
- **Emerging Threat Landscape:** Growing cybersecurity challenges requiring proactive threat modeling

### 2.3 Applicable Data Protection Regulations

**GDPR (General Data Protection Regulation)** - EU regulation applicable globally for EU citizen data
- Key principles: lawfulness, fairness, transparency, purpose limitation, data minimization
- User rights: access, rectification, erasure, portability, right to be forgotten
- Significant penalties for non-compliance (up to €20M or 4% of global revenue)

**UK Data Protection Act (DPA 2018)**
- UK-specific implementation of GDPR principles
- Applies to processing of UK resident data

**California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)**
- Applies to California residents' data
- Enhanced consumer rights and business obligations

**National Data Protection Laws in Target Regions**
- Morocco: Law on the Protection of Persons with Regard to the Processing of Personal Data
- Egypt: Data Protection Law (emerging framework)
- Nigeria: Nigeria Data Protection Regulation (NDPR)
- Kenya: Data Protection Act (2019)
- Kenya: Personal Data Protection Act
- South Africa: Protection of Personal Information Act (POPIA)

**Compliance Approach:** UtopiaHire implements a **maximum protection baseline** aligned with GDPR principles, ensuring compliance with stricter regional requirements while maintaining operational efficiency.

---

## 3. Security Governance & Organizational Structure

### 3.1 Security Leadership & Responsibilities

The **UtopiaHire Security Team** bears overall responsibility for the platform's security posture. Key organizational responsibilities include:

**Strategic Functions:**
- **Threat Modeling:** Quarterly threat modeling exercises using **STRIDE methodology** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) for all new features and architectural changes
- **Policy Governance:** Annual comprehensive review and update of security policies with quarterly compliance audits
- **Incident Response:** End-to-end management of the security incident lifecycle following NIST framework: Preparation → Detection & Analysis → Containment → Eradication & Recovery → Post-Incident Activity
- **Compliance Management:** Ensuring adherence to GDPR, regional data protection laws, and industry standards (OWASP Top 10, NIST Cybersecurity Framework)
- **Vendor Security:** Assessments and continuous monitoring of third-party service providers

### 3.2 Incident Reporting & Escalation

Security incidents are logged in `INCIDENT-LOG.md` with the following classification:

- **Critical (P1):** Immediate breach of confidentiality, integrity, or availability affecting user data or platform availability
- **High (P2):** Significant security issue requiring remediation within 24 hours
- **Medium (P3):** Moderate vulnerability or security gap requiring remediation within 7 days
- **Low (P4):** Minor issues or policy deviations requiring resolution within 30 days

---

## 4. Application Security (AppSec)

### 4.1 Secure Software Development Lifecycle (SDLC)

Security is embedded at every phase of development:

#### **Design Phase**
- Formal security design review for all new features
- Threat modeling using STRIDE methodology
- Security architecture assessment
- Privacy impact assessment (PIA) for features handling PII

#### **Development Phase**
- Secure coding guidelines for Node.js/Express and React/Next.js
- Static code review checklist enforcement
- Use of security-focused IDE plugins and pre-commit hooks
- Regular training on OWASP Top 10 vulnerabilities and mitigation strategies

#### **Testing Phase**

**Static Application Security Testing (SAST):**
- Integrated automated SAST scans in CI/CD pipeline
- Tools: ESLint security plugins, Semgrep with custom rulesets
- Severity thresholds: Blocks merge for critical/high findings
- Coverage target: 100% of custom code

**Dependency Management:**
- Continuous vulnerability scanning using `npm audit` and Snyk
- Automated alerts for zero-day vulnerabilities
- **SLA for vulnerability remediation:**
  - Critical vulnerabilities: 24 hours
  - High severity: 7 days
  - Medium severity: 30 days
  - Low severity: 90 days
- Quarterly dependency updates and compatibility testing

**Dynamic Application Security Testing (DAST):**
- Quarterly DAST assessments in staging environment
- Tools: OWASP ZAP for API and application scanning
- Coverage: All authenticated and unauthenticated endpoints
- Findings tracked and prioritized for remediation

**Manual Security Testing:**
- Peer review with mandatory security checklist for all PRs
- Minimum one security-focused reviewer for sensitive modules
- Annual penetration testing by external security firm

### 4.2 Authentication & Authorization

#### **Authentication Mechanisms**

**Password-Based Authentication:**
- Backend: Node.js with Passport.js authentication framework
- Password hashing: `bcryptjs` with cost factor of 12 (minimum)
- Password policy: Minimum 12 characters, complexity requirements enforced
- Account lockout: 5 failed attempts trigger 15-minute lockout
- No plaintext password storage or transmission

**Federated Identity (OAuth 2.0):**
- Supported provider: Google OAuth 2.0
- Scope limitation: Only necessary user information requested
- Redirect URI validation: Strict allowlist of authorized redirect URLs
- Future support: Microsoft, Apple, and regional providers (OnTrust, etc.)

#### **Session Management**

**JWT-Based Stateless Sessions:**
- Algorithm: HS256 for signing (RS256 for future production)
- Secret Management: Stored securely in environment variables, rotated quarterly
- Token Expiration:
  - Access tokens: 15 minutes
  - Refresh tokens: 7 days
- Token Storage:
  - Access tokens: Memory (JavaScript) for XSS protection
  - Refresh tokens: Secure, httpOnly, SameSite cookies to prevent CSRF
- Invalidation: Upon logout, password change, or suspicious activity

**Session Security Headers:**
- `Secure` flag: Enforces HTTPS transmission
- `HttpOnly` flag: Prevents JavaScript access to sensitive cookies
- `SameSite=Strict`: Mitigates CSRF attacks
- Token rotation: New tokens issued on refresh to minimize compromise window

#### **Authorization & Access Control**

- **API-Level Enforcement:** Custom Express middleware verifies JWT and enforces role-based access control (RBAC)
- **Principle of Least Privilege:** Users granted only minimum necessary permissions
- **Role Definitions:**
  - **Job Seeker:** Resume upload, interview practice, job browsing, profile management
  - **Recruiter/Admin:** Job posting, candidate review, platform administration
  - **System Administrator:** Infrastructure, security configuration, audit log access
- **Endpoint Protection:** All protected endpoints require valid JWT with appropriate role claims
- **Audit Logging:** All authorization decisions logged for compliance and forensic analysis

### 4.3 Data Validation & Sanitization

#### **API Input Validation**

- **Schema Validation:** All incoming data validated against strict schemas using middleware
- **Library:** Joi or Zod for comprehensive validation
- **Coverage:** NoSQL injection prevention, oversized payload rejection, malformed data filtering
- **Rate Limiting:**
  - Authentication endpoints: 5 requests per 15 minutes per IP
  - General API endpoints: 100 requests per hour per authenticated user
  - Resume upload: 10 uploads per day per user

#### **Output Encoding & XSS Prevention**

- **Automatic Encoding:** React automatically encodes rendered data
- **Dangerous Operations:** `dangerouslySetInnerHTML` use cases require:
  - Security review and approval
  - DOMPurify sanitization for HTML content
  - Content Security Policy (CSP) headers
- **CSP Implementation:**
  - `default-src 'self'`
  - `script-src 'self' 'nonce-{random}'`
  - `style-src 'self' 'unsafe-inline'` (with migration plan)
  - Regular CSP violation monitoring

#### **File Upload Security**

- **Library:** Multer with strict configuration
- **Allowed Types:** PDF, DOCX, DOC, TXT for resumes (whitelist-based validation)
- **File Size Limits:** 5MB maximum per resume
- **Malware Scanning:** All uploaded files scanned before processing (ClamAV integration)
- **Storage Location:** Uploaded files stored outside web root with restricted permissions
- **Filename Handling:** Randomized filenames to prevent path traversal attacks
- **Execution Prevention:** Web server configured to prevent execution of uploaded content

### 4.4 CSRF & CORS Protection

- **CSRF Tokens:** Double-submit cookie pattern for state-changing operations
- **CORS Configuration:**
  - Whitelist of allowed origins
  - `credentials: true` only for trusted origins
  - Preflight request validation
  - Avoid `Access-Control-Allow-Origin: *` in production

---

## 5. Data Protection & Privacy

### 5.1 Data Encryption

#### **In Transit**

- **Protocol:** TLS 1.2 or higher (target: TLS 1.3)
- **Cipher Suites:** Only strong algorithms (no MD5, DES, RC4)
- **Certificate Management:** 
  - Valid, trusted SSL/TLS certificates
  - HTTPS enforcement via HSTS headers (max-age: 31536000)
  - Certificate monitoring and renewal automation
- **Client-Server Communication:** All API calls encrypted end-to-end
- **Third-Party Integrations:** TLS enforcement with external services

#### **At Rest**

- **Database Encryption:** MongoDB configured with AES-256 encryption for all data at rest
- **Application-Level Encryption:** Sensitive fields (SSNs, government IDs, compensation data) encrypted at application layer using AES-256-GCM
- **Key Management:**
  - Encryption keys stored separately from encrypted data
  - Key rotation policy: Annually or upon compromise
  - Access to keys restricted to essential personnel only
- **Backup Security:** All backups encrypted with equivalent strength to production data

### 5.2 Personally Identifiable Information (PII) Handling

#### **Data Minimization**

- **Collection:** Only essential data collected for platform functionality
- **Purpose Limitation:** Data used solely for stated purposes
- **Retention:** PII deleted after 12 months of account inactivity or upon user request
- **User Consent:** Explicit opt-in for data processing activities

#### **PII Processing Standards**

- **Access Logging:** Strict audit trail of who accessed sensitive data and when
- **Resume Data:** Treated as highly sensitive; access restricted to authorized reviewers only
- **Interview Data:** Recording and transcripts encrypted and access-controlled
- **Aggregated Insights:** Interview feedback anonymized to prevent identification

#### **Data Subject Rights (GDPR Compliance)**

- **Right to Access:** Users can download their data in machine-readable format within 30 days
- **Right to Rectification:** Users can correct inaccurate data
- **Right to Erasure:** Data deleted upon request (except where legally required retention applies)
- **Right to Portability:** Export data in standard formats (JSON, CSV)
- **Right to Object:** Users can opt-out of data processing activities
- **Technical Implementation:** Self-service portal for data requests with identity verification

---

## 6. Module-Specific Security Considerations

### 6.1 Core Backend (Node.js/Express)

#### **API Security**

- **Rate Limiting:** Applied to all endpoints with adaptive thresholds
- **Request Validation:** Payload size limits (JSON: 1MB, Multipart: 100MB for file uploads)
- **Middleware Ordering:** Security handlers (authentication, logging, rate limiting) execute before business logic
- **Error Handling:**
  - Generic error messages in production (no sensitive information leakage)
  - Detailed logs maintained for debugging without exposing in responses
  - Stack traces hidden from users

#### **Secret Management**

- **Storage:** All secrets (API keys, database credentials, JWT secrets) stored in environment variables
- **No Hardcoding:** Source code scanning prevents accidental secret commits
- **Rotation Schedule:**
  - API keys: Quarterly
  - Database credentials: Bi-annually or upon compromise
  - JWT secrets: Annually
- **Access Control:** Secrets accessible only to necessary deployment environments

#### **Logging & Monitoring**

- **Security Logging:**
  - Failed authentication attempts with IP and timestamp
  - Authorization failures
  - Data access events
  - Configuration changes
- **Log Retention:** 90 days for active logs, 1 year for archived logs
- **Log Protection:** Logs stored securely with restricted access (RBAC)
- **Monitoring Alerts:**
  - Suspicious authentication patterns
  - Unusual data access
  - Rate limiting threshold exceedances
  - System resource anomalies

### 6.2 AI Services (Resume Reviewer & Interview Simulator)

#### **Prompt Injection Prevention**

- **Input Sanitization:**
  - All user-supplied input validated and sanitized before LLM processing
  - Special characters and prompt keywords filtered
  - Input length limits enforced
- **Output Parsing:** Structured output validation to detect injection attempts
- **Monitoring:** Anomalous prompt patterns flagged for review
- **User Education:** Guidelines on appropriate input provided in UI

#### **Data Privacy in AI Processing**

- **PII Masking:** Resume data programmatically masked before AI processing
  - Name, email, phone number, address replaced with tokens
  - Government IDs and financial information removed
- **Federated Learning:** Future consideration for on-device model processing
- **Data Retention:** AI processing logs deleted after 30 days
- **Vendor Compliance:** Third-party AI service providers (e.g., OpenAI) comply with data processing agreements and GDPR

#### **Ethical AI & Bias Mitigation**

- **Fairness Assessment:** Monthly evaluation of AI outputs for demographic bias
- **Audit Trail:** All AI-generated feedback logged for review and appeal
- **Human Review:** Complex or sensitive decisions escalated to human reviewers
- **Transparency:** Users informed when AI is making decisions affecting their opportunities
- **Appeal Mechanism:** Users can contest AI-generated feedback with human review

### 6.3 Job Matcher Module

- **Recommendation Logic:** Algorithm fairness audits to prevent demographic discrimination
- **Data Isolation:** Candidate matching data segregated from recruiter data
- **Accuracy Verification:** Regular testing to ensure recommendations remain relevant and non-biased

### 6.4 Footprint Scanner Module

- **Third-Party API Security:**
  - OAuth 2.0 for LinkedIn/GitHub authentication
  - Minimal scope requests (no write permissions)
  - Token expiration: Refresh tokens monthly
- **Data Aggregation Security:**
  - Temporary storage of footprint data (24-hour retention)
  - Aggregation only with explicit user consent
  - No sharing of personal projects or private repositories without permission

---

## 7. Infrastructure & Deployment Security

### 7.1 Network Security

- **Firewall Rules:** Restrictive inbound rules, whitelist-based approach
- **VPC Configuration:** Segregation of frontend, backend, and database tiers
- **WAF (Web Application Firewall):** Protection against OWASP Top 10 attacks
- **DDoS Mitigation:** Rate limiting and traffic anomaly detection

### 7.2 Container & Orchestration Security

- **Docker Image Scanning:** Container images scanned for vulnerabilities before deployment
- **Runtime Security:** Container escape and privilege escalation monitoring
- **Configuration:** Non-root user execution, read-only root filesystem where possible
- **Secret Injection:** Secrets passed via secure mechanisms, not embedded in images

### 7.3 Database Security

- **Access Control:**
  - Database connections limited to backend servers only
  - Role-based database user permissions
  - No direct internet access to database instances
- **Backup Security:**
  - Automated daily backups with encryption
  - Backup encryption keys stored separately
  - Backup restoration tested quarterly
- **Data Isolation:** Database rows filtered at application level based on user role and tenancy

---

## 8. Vulnerability Management

### 8.1 Vulnerability Assessment Process

1. **Identification:** Automated scanning (SAST/DAST) + manual reviews
2. **Classification:** Severity assigned using CVSS scores
3. **Prioritization:** Critical vulnerabilities addressed within 24 hours
4. **Remediation:** Fix developed, tested, and deployed
5. **Verification:** Vulnerability confirmation and regression testing
6. **Documentation:** Findings logged in `INCIDENT-LOG.md`

### 8.2 Patch Management

- **Security Patches:** Critical patches deployed within 24 hours
- **Regular Updates:** Monthly patch windows for non-critical updates
- **Dependency Audits:** Monthly review of dependency updates and compatibility
- **Zero-Day Response:** Expedited assessment and patching protocol

---

## 9. Vulnerability Disclosure & Incident Response

### 9.1 Responsible Disclosure Program

- **Reporting Channel:** `security@utopiahire.com`
- **Acknowledgment:** Initial response within 24 hours
- **Safe Harbor Policy:** Legal immunity for good-faith researchers who report vulnerabilities responsibly
- **Confidentiality:** Researcher identity protected during investigation
- **Resolution Timeline:**
  - Critical: Fix within 24 hours
  - High: Fix within 7 days
  - Medium: Fix within 30 days
- **Publication:** Coordinated disclosure after fix deployment

### 9.2 Incident Response Framework

**NIST-Based Incident Lifecycle:**

- **Preparation:** Team training, tool setup, communication templates ready
- **Detection & Analysis:** Security monitoring identifies unusual activity; incidents classified by severity
- **Containment:** Short-term measures isolate affected systems; long-term measures prevent recurrence
- **Eradication & Recovery:** Malware/intruders removed; systems restored to secure state
- **Post-Incident Activity:** Root cause analysis, lessons learned, process improvements

**Incident Communication:**
- Users notified of data breaches within 72 hours (GDPR requirement)
- Regulatory bodies notified as required by applicable laws
- Transparent communication about incident scope and remediation steps
- Regular status updates until resolution

### 9.3 Incident Logging

All security incidents documented in `INCIDENT-LOG.md` with:
- Incident date/time and detection method
- Severity classification and affected systems
- Initial response and containment actions
- Root cause analysis findings
- Remediation steps and timeline
- Post-incident improvements

---

## 10. Third-Party & Vendor Security

### 10.1 Vendor Assessment

- **Due Diligence:** Security questionnaires and capability assessments
- **Compliance Verification:** Confirmation of relevant certifications (SOC 2, ISO 27001)
- **Data Processing Agreement:** GDPR-compliant DPA for all vendors handling user data
- **Regular Audits:** Quarterly reviews of vendor security practices

### 10.2 API & Third-Party Integration Security

- **OAuth 2.0 Enforcement:** Third-party integrations use OAuth 2.0 with minimal scopes
- **Token Management:** Secure storage and regular rotation of third-party API credentials
- **Monitoring:** Unusual API usage patterns flagged for investigation
- **Rate Limiting:** Apply internal rate limits to third-party API calls

---

## 11. Compliance & Audit

### 11.1 Compliance Audits

- **Frequency:** Quarterly internal audits, annual external audits
- **Scope:** Full coverage of GDPR, regional laws, and NIST guidelines
- **Documentation:** Audit findings and remediation tracking
- **Evidence Collection:** Logs, configurations, and security assessments collected for regulatory review

### 11.2 Data Subject Requests

All Data Subject Access Requests (DSARs) processed within 30 days:
- **Access Requests:** User data compiled in machine-readable format
- **Deletion Requests:** Data purged within 30 days (retention requirements noted)
- **Correction Requests:** Inaccurate data updated immediately
- **Portability Requests:** Data exported in standard formats

### 11.3 Privacy Impact Assessment (PIA)

- **Conducted For:** New features processing PII, system changes affecting data handling
- **Review Points:** Data collection, processing, storage, sharing, retention
- **Documentation:** PIA reports retained for regulatory review

---

## 12. Security Awareness & Training

### 12.1 Team Training

- **Onboarding:** All team members complete security training before access granted
- **Ongoing Education:** Quarterly security awareness sessions covering OWASP Top 10, phishing tactics, social engineering
- **Specialized Training:**
  - Developers: Secure coding practices (Node.js/React specific)
  - Operations: Incident response and log analysis
  - Security Team: Threat modeling and vulnerability assessment

### 12.2 User Education

- **Security Tips:** Guidance on password management, phishing recognition
- **Privacy Information:** Clear explanation of data handling and user rights
- **Responsible AI:** Education on ethical use of AI interview feedback
## Appendix: Acronyms & References

**Security Standards & Frameworks:**
- NIST: National Institute of Standards and Technology
- OWASP: Open Web Application Security Project
- GDPR: General Data Protection Regulation
- STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
- SAST: Static Application Security Testing
- DAST: Dynamic Application Security Testing
- JWT: JSON Web Token
- RBAC: Role-Based Access Control
- CSP: Content Security Policy
- CSRF: Cross-Site Request Forgery
- CORS: Cross-Origin Resource Sharing
- DPA: Data Processing Agreement
- PII: Personally Identifiable Information
- DSAR: Data Subject Access Request
- PIA: Privacy Impact Assessment

**External Resources:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [GDPR Official Text](https://gdpr-info.eu/)
- [NIST Incident Response Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)
