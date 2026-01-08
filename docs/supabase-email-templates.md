# Supabase Email Templates

Styled HTML email templates for Game Datacards authentication flows.
Copy and paste each template into **Supabase Dashboard → Authentication → Email Templates**.

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#c9a227` | CTA buttons, accents |
| Gold Light | `#e3c65c` | Button hover |
| Navy | `#0a1628` | Header/footer background |
| Navy Light | `#0f1f35` | Secondary background |
| Text Main | `#f1f5f9` | Headers on dark bg |
| Text Muted | `#94a3b8` | Footer text |

---

## 1. Confirm Signup

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0a1628 0%, #0f1f35 100%); padding: 32px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">Welcome to Game Datacards</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thanks for signing up! Please confirm your email address to get started with Game Datacards.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                Click the button below to verify your email and activate your account.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0a1628; background: linear-gradient(135deg, #e3c65c 0%, #c9a227 50%, #a68419 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);">Confirm Email</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="margin: 32px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #c9a227; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a1628; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f1f5f9;">Game Datacards</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0a1628 0%, #0f1f35 100%); padding: 32px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">Reset Your Password</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                We received a request to reset your password for your Game Datacards account.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                Click the button below to set a new password. This link will expire in 24 hours.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0a1628; background: linear-gradient(135deg, #e3c65c 0%, #c9a227 50%, #a68419 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);">Reset Password</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="margin: 32px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #c9a227; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a1628; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f1f5f9;">Game Datacards</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
***REMOVED***
---

## 3. Magic Link

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Game Datacards</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0a1628 0%, #0f1f35 100%); padding: 32px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">Sign In to Game Datacards</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                Click the button below to securely sign in to your Game Datacards account. No password needed!
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                This magic link will expire in 1 hour for security.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0a1628; background: linear-gradient(135deg, #e3c65c 0%, #c9a227 50%, #a68419 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);">Sign In</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="margin: 32px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #c9a227; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a1628; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f1f5f9;">Game Datacards</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your new email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0a1628 0%, #0f1f35 100%); padding: 32px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">Confirm Email Change</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                You requested to change your email address for your Game Datacards account.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                Click the button below to confirm this new email address.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0a1628; background: linear-gradient(135deg, #e3c65c 0%, #c9a227 50%, #a68419 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);">Confirm Email</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="margin: 32px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #c9a227; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a1628; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f1f5f9;">Game Datacards</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If you didn't request this change, please contact support immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Invite User

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to Game Datacards</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0a1628 0%, #0f1f35 100%); padding: 32px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">You're Invited!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                You've been invited to join Game Datacards - the ultimate tool for managing your game datacards and army lists.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                Click the button below to accept your invitation and set up your account.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0a1628; background: linear-gradient(135deg, #e3c65c 0%, #c9a227 50%, #a68419 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);">Accept Invite</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback Link -->
              <p style="margin: 32px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #c9a227; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a1628; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #f1f5f9;">Game Datacards</p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## How to Apply

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select the template type (e.g., "Confirm signup")
3. Paste the corresponding HTML from above
4. Click **Save**

## Notes

- Templates use the `{{ .ConfirmationURL }}` Supabase variable
- Inline CSS ensures compatibility with all major email clients
- Table-based layout works in Outlook and older clients
- Gold (#c9a227) accent color matches the app's premium branding
