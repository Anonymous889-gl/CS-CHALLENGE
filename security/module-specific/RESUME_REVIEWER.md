# Security Architecture - Resume Reviewer Module

## Overview
This module implements security-by-design principles for the UtopiaHire platform's Resume Reviewer functionality using Gemini API.

## Security Features

### 1. API Key Protection
- Environment-based configuration
- Never committed to version control
- Supports multiple secret storage methods

### 2. Input Validation
- File type and size validation
- Prompt injection detection
- Text sanitization and length limits
- SQL injection prevention

### 3. Rate Limiting
- 60 requests/minute default
- Token bucket algorithm
- Graceful degradation on limit

### 4. Authentication & Authorization
- JWT-based authentication
- User-specific data access
- Session management

### 5. Audit Logging
- All API calls logged
- Security events tracked
- No PII in logs

### 6. Data Privacy
- PII handling per GDPR principles
- Gemini data retention: [See Google's policy]
- User data deletion support

## Threat Model
- **Prompt Injection**: Mitigated via pattern detection
- **API Key Leakage**: Prevented via environment variables & .gitignore
- **Rate Limit Abuse**: Controlled via token bucket limiter
- **Unauthorized Access**: JWT authentication required
- **Data Breach**: Audit logs + access controls

