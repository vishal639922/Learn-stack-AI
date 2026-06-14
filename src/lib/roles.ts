export type UserRole = "user" | "admin" | "subadmin" | "editor" | "author";

export const ALL_ROLES: UserRole[] = [
  "user",
  "admin",
  "subadmin",
  "editor",
  "author",
];

export const STAFF_ROLES: UserRole[] = [
  "admin",
  "subadmin",
  "editor",
  "author",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "User",
  admin: "Admin",
  subadmin: "Sub Admin",
  editor: "Editor",
  author: "Author",
};

export function isStaffRole(role: string): role is UserRole {
  return STAFF_ROLES.includes(role as UserRole);
}

export function canAccessAdminPanel(role: string): boolean {
  return isStaffRole(role);
}

export function canManageCategories(role: string): boolean {
  return role === "admin" || role === "subadmin";
}

export function canManageUsers(role: string): boolean {
  return role === "admin" || role === "subadmin";
}

export function canAssignRole(actorRole: string, targetRole: UserRole): boolean {
  if (actorRole === "admin") {
    return ALL_ROLES.includes(targetRole);
  }
  if (actorRole === "subadmin") {
    return ["editor", "author", "user"].includes(targetRole);
  }
  return false;
}

export function canManageTheme(role: string): boolean {
  return role === "admin";
}

export function canCreateArticles(role: string): boolean {
  return ["admin", "subadmin", "editor", "author"].includes(role);
}

export function canEditAnyArticle(role: string): boolean {
  return ["admin", "subadmin", "editor"].includes(role);
}

export function canDeleteArticles(role: string): boolean {
  return role === "admin" || role === "subadmin" || role === "editor";
}

export function canViewAnalytics(role: string): boolean {
  return role === "admin" || role === "subadmin";
}

export function canReviewArticles(role: string): boolean {
  return role === "admin" || role === "subadmin" || role === "editor";
}
