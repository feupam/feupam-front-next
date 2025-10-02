// Lista de emails autorizados para acessar a área admin
export const ADMIN_EMAILS = ["arielaaaaa1@gmail.com", "lss.romulo@gmail.com", "wilian.guimaraaes@gmail.com", "anavianna1211@gmail.com", "biancaalvarengampraes@gmail.com"];

/**
 * Verifica se um email tem permissões de administrador
 * @param email - Email do usuário
 * @returns true se o email está na lista de admins
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false;
}

/**
 * Verifica se um usuário tem permissões de administrador
 * @param user - Objeto do usuário com propriedade email
 * @returns true se o usuário é admin
 */
export function isAdmin(user: { email?: string | null } | null | undefined): boolean {
  return isAdminEmail(user?.email);
}