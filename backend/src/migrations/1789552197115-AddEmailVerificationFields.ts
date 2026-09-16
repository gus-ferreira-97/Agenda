import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailVerificationFields1789552197115 implements MigrationInterface {
    name = 'AddEmailVerificationFields1789552197115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verification_token" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verification_expires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verification_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verification_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
    }

}
