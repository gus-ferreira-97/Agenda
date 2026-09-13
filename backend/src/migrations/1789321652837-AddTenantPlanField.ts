import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantPlanField1789321652837 implements MigrationInterface {
    name = 'AddTenantPlanField1789321652837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "plan" character varying(20) NOT NULL DEFAULT 'basico'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "plan"`);
    }

}
