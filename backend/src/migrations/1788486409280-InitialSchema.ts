import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788486409280 implements MigrationInterface {
    name = 'InitialSchema1788486409280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "subdomain" character varying(100) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'ativo', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_21bb89e012fa5b58532009c1601" UNIQUE ("subdomain"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenants"`);
    }

}
