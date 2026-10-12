# Express Routing Order Precedence Rule

## Policy
In Express.js router definitions where parametric capture patterns exist (such as `/:username` or `/:slug`):
1. **Declare Specific and Static Routes First**: Specific endpoints (`/me`, `/settings`, `/analytics`, `/vcard`, `/check-username/:username`) MUST ALWAYS be registered BEFORE parameterized root patterns (`/:username`).
2. **Prevent Parametric Route Shadowing**: Registering `router.get('/:username')` before `router.get('/me')` causes requests to `/me` to match the parametric handler with `req.params.username = 'me'`, bypassing authentication and resulting in unexpected 404 or authentication failure.
