import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantTrialFields1789338222721 implements MigrationInterface {
    name = 'AddTenantTrialFields1789338222721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "trial_started_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "trial_ends_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "trial_used" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "trial_used"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "trial_ends_at"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "trial_started_at"`);
    }

}
