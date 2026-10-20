import { db } from './index.ts';
import { users } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  name?: string
) {
  try {
    const displayName = name || email.split('@')[0] || 'Administrator';
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: displayName,
        role: 'admin',
        accountStatus: 'active',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account with database.', {
      cause: error,
    });
  }
}

export async function listUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database query failed in listUsers:', error);
    throw new Error('Failed to fetch administrator accounts.', {
      cause: error,
    });
  }
}

export async function updateUserRoleAndStatus(
  id: number,
  role: string,
  accountStatus: string
) {
  try {
    const result = await db
      .update(users)
      .set({
        role,
        accountStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateUserRoleAndStatus:', error);
    throw new Error('Failed to update administrator account.', {
      cause: error,
    });
  }
}
