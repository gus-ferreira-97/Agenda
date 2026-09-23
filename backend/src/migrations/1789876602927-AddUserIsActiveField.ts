import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIsActiveField1789876602927 implements MigrationInterface {
    name = 'AddUserIsActiveField1789876602927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
    }

}
