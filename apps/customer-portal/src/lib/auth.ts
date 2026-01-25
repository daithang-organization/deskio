export type Role = 'ADMIN' | 'AGENT' | 'CUSTOMER';

export type Session = {
  userId: string;
  role: Role;
  workspaceId: string;
};

export function getSession(): Session | null {
  // Sprint 0 placeholder:
  // Sprint 1 will parse cookies/JWT from identity-service.
  return null;
}
