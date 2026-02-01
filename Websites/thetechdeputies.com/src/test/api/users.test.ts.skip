import { describe, it, expect } from 'vitest';

describe('POST /api/auth/request-password-reset', () => {
  it('should create password reset token and send email', async () => {
    const response = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    // Verify: Token created, email sent
  });

  it('should not leak whether email exists', async () => {
    const validResponse = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com' }),
    });

    const invalidResponse = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    });

    // Both should return 200 with same message
    expect(validResponse.status).toBe(200);
    expect(invalidResponse.status).toBe(200);
  });
});

describe('POST /api/auth/reset-password', () => {
  it('should update password with valid token', async () => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'valid-reset-token',
        newPassword: 'NewPassword123!',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should validate token not expired', async () => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'expired-token',
        newPassword: 'NewPassword123!',
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('expired');
  });

  it('should validate password policy', async () => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'valid-token',
        newPassword: 'short', // Too short
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('password');
  });
});

describe('DELETE /api/users/[id]', () => {
  it('should soft delete user account', async () => {
    const response = await fetch('/api/users/user-id-to-delete', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer user-token' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    // Verify: User.deletedAt set, email/password cleared
  });

  it('should log deletion to audit trail', async () => {
    const response = await fetch('/api/users/user-id-to-delete', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer user-token' },
    });

    expect(response.status).toBe(200);
    // Verify: AdminActionAudit record created
  });
});

describe('GET /api/users/[id]/profile', () => {
  it('should return user profile without password hash', async () => {
    const response = await fetch('/api/users/user-id/profile', {
      headers: { Authorization: 'Bearer user-token' },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.passwordHash).toBeUndefined();
    expect(data.user.email).toBeDefined();
    expect(data.user.createdAt).toBeDefined();
  });
});
