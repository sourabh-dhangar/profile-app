# Windows CLI Script Execution Rule

## Policy
When running CLI commands on Windows within PowerShell:
1. **Never invoke bare `npm` or `npx`**: Bare execution attempts to launch `.ps1` wrappers (`npm.ps1`, `npx.ps1`), which will be blocked by PowerShell's `Restricted` ExecutionPolicy (`PSSecurityException`).
2. **Always invoke `.cmd` variants**: Always use `npm.cmd` and `npx.cmd`.
3. **Execute Node Scripts Directly**: When running custom scripts, use `node <script_path>` instead of shell aliases.
