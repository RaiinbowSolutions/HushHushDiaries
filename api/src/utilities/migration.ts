import { Migration, Migrator, MigrationProvider } from 'kysely';
import { Database } from './database';
import { BlogMigration } from './migrations/blog.migration';
import { CategoryMigration } from './migrations/category.migration';
import { CommentMigration } from './migrations/comment.migration';
import { LikeMigration } from './migrations/like.migration';
import { MessageMigration } from './migrations/message.migration';
import { PermissionMigration } from './migrations/permission.migration';
import { RequestMigration } from './migrations/request.migration';
import { UserMigration } from './migrations/user.migration';
import { UserCredentialMigration } from './migrations/userCredential.migration';
import { UserDetailMigration } from './migrations/userDetail.migration';
import { UserOptionMigration } from './migrations/userOption.migration';
import { UserPermissionMigration } from './migrations/userPermission.migration';

const Provider: MigrationProvider = {
    getMigrations: async (): Promise<Record<string, Migration>> => {
        let results: Record<string, Migration> = {
            'blog': BlogMigration,
            'category': CategoryMigration,
            'comment': CommentMigration,
            'like': LikeMigration,
            'message': MessageMigration,
            'permission': PermissionMigration,
            'request': RequestMigration,
            'user': UserMigration,
            'user credential': UserCredentialMigration,
            'user detail': UserDetailMigration,
            'user option': UserOptionMigration,
            'user permission': UserPermissionMigration,
        };

        return results;
    }
}

export async function MigrateToLatest() {
    let db = Database;

    const migrator = new Migrator({
        db,
        provider: Provider,
    });
    const { error, results } = await migrator.migrateToLatest();
  
    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`)
        }
    });
  
    if (error) {
      console.error('failed to migrate');
      console.error(error);
      process.exit(1);
    }
  
    await db.destroy();
}