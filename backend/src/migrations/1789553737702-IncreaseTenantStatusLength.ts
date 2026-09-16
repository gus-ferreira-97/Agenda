import { MigrationInterface, QueryRunner } from "typeorm";

export class IncreaseTenantStatusLength1789553737702 implements MigrationInterface {
    name = 'IncreaseTenantStatusLength1789553737702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "status" character varying(30) NOT NULL DEFAULT 'ativo'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "status" character varying(20) NOT NULL DEFAULT 'ativo'`);
    }

}
