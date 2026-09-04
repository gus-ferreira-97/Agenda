import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllEntities1788486897848 implements MigrationInterface {
    name = 'CreateAllEntities1788486897848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "professional_id" integer NOT NULL, "service_id" integer NOT NULL, "customer_name" character varying(255) NOT NULL, "customer_contact" character varying(255) NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "name" character varying(255) NOT NULL, "description" text, "duration_minutes" integer NOT NULL, "price" numeric(10,2), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "professional_services" ("professional_id" integer NOT NULL, "service_id" integer NOT NULL, "tenant_id" integer NOT NULL, CONSTRAINT "PK_b3073a22d2e21fadf41fa8e2553" PRIMARY KEY ("professional_id", "service_id"))`);
        await queryRunner.query(`CREATE TABLE "work_schedules" ("id" SERIAL NOT NULL, "professional_id" integer NOT NULL, "tenant_id" integer NOT NULL, "day_of_week" integer NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "break_start" TIME, "break_end" TIME, CONSTRAINT "PK_f5251879700e5ca0d2e353fa34f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "professionals" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "name" character varying(255) NOT NULL, "specialty" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d7dc8473b49fcd938def2799387" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "tenant_id" integer, "user_id" integer, "action" character varying(100) NOT NULL, "entity" character varying(100) NOT NULL, "entity_id" integer NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenant_configs" ("tenant_id" integer NOT NULL, "opening_time" TIME, "closing_time" TIME, "slot_interval" integer NOT NULL DEFAULT '30', "timezone" character varying(100) NOT NULL DEFAULT 'America/Sao_Paulo', CONSTRAINT "PK_51fc9c755d5160a6a8f42017c57" PRIMARY KEY ("tenant_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "tenant_id" integer, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_75b2a97fbf18573d71d10561135" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_60b7a60cf6727d87d525a750414" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_847c3b57ab049376d3380329a9c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "professional_services" ADD CONSTRAINT "FK_34a4319abc2199d0e68811d1824" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "professional_services" ADD CONSTRAINT "FK_2fad8b472d2afd9af6c048b715c" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "professional_services" ADD CONSTRAINT "FK_1c47f74d26f46a82df6811c3179" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_schedules" ADD CONSTRAINT "FK_28fc60d5daad91d2727a9b29990" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_schedules" ADD CONSTRAINT "FK_3b20a2f889fe306684adcafa266" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "professionals" ADD CONSTRAINT "FK_be8fb602011fa919a81d140db67" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_configs" ADD CONSTRAINT "FK_51fc9c755d5160a6a8f42017c57" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`);
        await queryRunner.query(`ALTER TABLE "tenant_configs" DROP CONSTRAINT "FK_51fc9c755d5160a6a8f42017c57"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7"`);
        await queryRunner.query(`ALTER TABLE "professionals" DROP CONSTRAINT "FK_be8fb602011fa919a81d140db67"`);
        await queryRunner.query(`ALTER TABLE "work_schedules" DROP CONSTRAINT "FK_3b20a2f889fe306684adcafa266"`);
        await queryRunner.query(`ALTER TABLE "work_schedules" DROP CONSTRAINT "FK_28fc60d5daad91d2727a9b29990"`);
        await queryRunner.query(`ALTER TABLE "professional_services" DROP CONSTRAINT "FK_1c47f74d26f46a82df6811c3179"`);
        await queryRunner.query(`ALTER TABLE "professional_services" DROP CONSTRAINT "FK_2fad8b472d2afd9af6c048b715c"`);
        await queryRunner.query(`ALTER TABLE "professional_services" DROP CONSTRAINT "FK_34a4319abc2199d0e68811d1824"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_847c3b57ab049376d3380329a9c"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_60b7a60cf6727d87d525a750414"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_75b2a97fbf18573d71d10561135"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "tenant_configs"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "professionals"`);
        await queryRunner.query(`DROP TABLE "work_schedules"`);
        await queryRunner.query(`DROP TABLE "professional_services"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
    }

}
