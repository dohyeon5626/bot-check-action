export function isAllowedUser(username: string, allowedUsers: string): boolean {
  if (!allowedUsers) return false;
  return allowedUsers.split(',').map((u) => u.trim()).includes(username);
}
