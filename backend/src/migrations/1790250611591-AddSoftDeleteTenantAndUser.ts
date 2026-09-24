import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteTenantAndUser1790250611591 implements MigrationInterface {
    name = 'AddSoftDeleteTenantAndUser1790250611591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "deleted_at"`);
    }

}
