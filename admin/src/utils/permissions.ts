export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'JOURNALIST' | 'MEDIA_MANAGER' | 'USER';

/** Can edit any post (SUPER_ADMIN or ADMIN) OR own post (everyone else) */
export function canEditPost(user: { id: string; role: Role } | null, postAuthorId: string) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  return user.id === postAuthorId; // others can only edit their own
}

/** Can delete any post (SUPER_ADMIN or ADMIN) OR own post (everyone else) */
export function canDeletePost(user: { id: string; role: Role } | null, postAuthorId?: string) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
  if (postAuthorId) return user.id === postAuthorId; // others only their own
  return false;
}

/** Only SUPER_ADMIN can manage user accounts */
export function canManageUsers(user: { id: string; role: Role } | null) {
  if (!user) return false;
  return user.role === 'SUPER_ADMIN';
}

export function getRoleLabel(role: Role) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'مدير النظام (Super Admin)';
    case 'ADMIN':
      return 'رئيس التحرير (Admin)';
    default:
      return 'مستخدم عادي';
  }
}
