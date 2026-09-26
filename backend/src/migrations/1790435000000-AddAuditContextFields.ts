import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditContextFields1790435000000 implements MigrationInterface {
  name = 'AddAuditContextFields1790435000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD "ip_address" character varying(45)`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD "user_agent" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "user_agent"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "ip_address"`);
  }
}