import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetFields1789063972273 implements MigrationInterface {
    name = 'AddPasswordResetFields1789063972273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_token" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_expires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "FK_be8fb602011fa919a81d140db67"`);
        await queryRunner.query(`ALTER TABLE "professionals" ALTER COLUMN "tenant_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "FK_be8fb602011fa919a81d140db67" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "FK_be8fb602011fa919a81d140db67"`);
        await queryRunner.query(`ALTER TABLE "professionals" ALTER COLUMN "tenant_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "FK_be8fb602011fa919a81d140db67" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_token"`);
    }

}
