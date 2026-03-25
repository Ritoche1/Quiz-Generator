import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordForm from '@/components/ResetPasswordForm';

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/reset-password');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows check-email message after requesting reset link', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'If the account exists, password reset instructions have been sent.' }),
    });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send reset link/i }));

    expect(await screen.findByText(/password reset instructions have been sent/i)).toBeInTheDocument();
    expect(screen.getByText(/please check your email and click the reset link/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Reset token/i)).not.toBeInTheDocument();
  });

  test('uses token from URL to reset password without manual token entry', async () => {
    window.history.pushState({}, '', '/reset-password?token=token-from-email');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password updated successfully.' }),
    });

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByLabelText(/^New password$/i), {
      target: { value: 'new-secret' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm new password$/i), {
      target: { value: 'new-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'token-from-email', password: 'new-secret' }),
        })
      )
    );
    expect(await screen.findByText(/Your password has been updated/i)).toBeInTheDocument();
  });
});
