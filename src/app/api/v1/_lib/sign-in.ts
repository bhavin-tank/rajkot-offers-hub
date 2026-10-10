import { ADMIN_ROLES } from "@/server/services/auth";

/**
 * Who may sign in. Phase 2 opens sign-in to admins only; phase 3 (user
 * accounts) removes the restriction by setting this to undefined.
 */
export const SIGN_IN_ROLES = ADMIN_ROLES;
