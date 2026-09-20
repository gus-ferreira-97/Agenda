import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLoginAttemptFields1789854779136 implements MigrationInterface {
    name = 'AddUserLoginAttemptFields1789854779136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "failed_login_attempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "locked_until" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "locked_until"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failed_login_attempts"`);
    }

}
