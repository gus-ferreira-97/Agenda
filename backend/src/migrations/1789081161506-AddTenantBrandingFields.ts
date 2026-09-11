import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantBrandingFields1789081161506 implements MigrationInterface {
    name = 'AddTenantBrandingFields1789081161506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "primary_color" character varying(7) NOT NULL DEFAULT '#2563eb'`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "logo_url" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "welcome_message" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "address" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "welcome_message"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "logo_url"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "primary_color"`);
    }

}
