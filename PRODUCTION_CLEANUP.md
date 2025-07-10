# PRODUCTION CLEANUP CHECKLIST

This document outlines all development-only features that **MUST BE REMOVED** before deploying to production.

## Development-Only Features to Remove

### 1. Development Tools Component

**File**: `src/components/DevTools.tsx`

- **Action**: DELETE entire file
- **Description**: Contains delete user and sign out buttons for development testing
- **Security Risk**: Exposes user deletion functionality that should not be available in production

### 2. Delete User API Route

**File**: `src/app/api/dev/delete-user/route.ts`

- **Action**: DELETE entire file (or entire `/dev/` folder)
- **Description**: API endpoint for deleting users from database
- **Security Risk**: Could be exploited to delete user accounts maliciously

### 3. Dashboard Development Tools

**File**: `src/app/dashboard/page.tsx`

- **Action**: Remove DevTools import and component usage
- **Lines to remove**:
  ```typescript
  import DevTools from "../../components/DevTools";
  ```
  ```tsx
  {
    /* Development Tools */
  }
  <DevTools />;
  ```

### 4. Environment Configuration

**File**: `.env.example`

- **Action**: Review and update for production
- **Current development setup**: Contains SMTP configuration for Gmail
- **Production considerations**:
  - Use production email service
  - Remove any development-specific variables
  - Ensure all secrets are properly configured

## Security Considerations

### High Priority Removals

1. **User Deletion Functionality** - Can permanently destroy user data
2. **Development API Routes** - Could expose sensitive operations
3. **Environment Checks** - Ensure `NODE_ENV` is properly set to `production`

### Medium Priority Reviews

1. **Email Templates** - Review for production-appropriate branding
2. **Error Messages** - Ensure no sensitive information is exposed
3. **Logging** - Remove or secure development-specific console logs

## Pre-Production Checklist

### Before Deployment:

- [ ] Delete `src/components/DevTools.tsx`
- [ ] Delete `src/app/api/dev/` folder entirely
- [ ] Remove DevTools import and usage from dashboard
- [ ] Set `NODE_ENV=production` in production environment
- [ ] Review all console.log statements for sensitive data
- [ ] Test authentication flow without development tools
- [ ] Verify email service works with production SMTP settings
- [ ] Ensure database is properly secured
- [ ] Review all error messages for information leakage

### After Deployment:

- [ ] Confirm development tools are not accessible
- [ ] Test that `/api/dev/*` routes return 404
- [ ] Verify production email functionality
- [ ] Monitor logs for any development-related errors

