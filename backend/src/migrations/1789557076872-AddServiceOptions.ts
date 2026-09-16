import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceOptions1789557076872 implements MigrationInterface {
    name = 'AddServiceOptions1789557076872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_options" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "service_id" integer NOT NULL, "name" character varying(100) NOT NULL, "description" text, "image_url" character varying(500), "price" numeric(10,2), "duration_minutes" integer, "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b70f0ec158874012e053c3b3b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "service_option_id" integer`);
        await queryRunner.query(`ALTER TABLE "service_options" ADD CONSTRAINT "FK_e186eb6cb41af92b873a5115119" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_options" ADD CONSTRAINT "FK_6284451c53cd12c422e5d6e4b02" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_55ce15605ffe173cbf0cf508083" FOREIGN KEY ("service_option_id") REFERENCES "service_options"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_55ce15605ffe173cbf0cf508083"`);
        await queryRunner.query(`ALTER TABLE "service_options" DROP CONSTRAINT "FK_6284451c53cd12c422e5d6e4b02"`);
        await queryRunner.query(`ALTER TABLE "service_options" DROP CONSTRAINT "FK_e186eb6cb41af92b873a5115119"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "service_option_id"`);
        await queryRunner.query(`DROP TABLE "service_options"`);
    }

}
