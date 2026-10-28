# Auth email templates

Paste these into Supabase → Authentication → Emails → Templates.

| Template        | Subject                     | File                  |
| --------------- | --------------------------- | --------------------- |
| Confirm signup  | Confirm your Praz account   | `confirm-signup.html` |
| Reset password  | Reset your Praz password    | `reset-password.html` |

They use Supabase's `{{ .ConfirmationURL }}` and `{{ .Email }}` variables, so paste them as-is.
