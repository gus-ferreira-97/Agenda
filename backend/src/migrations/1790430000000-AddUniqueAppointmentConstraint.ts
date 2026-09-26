import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueAppointmentConstraint1790430000000
  implements MigrationInterface
{
  name = 'AddUniqueAppointmentConstraint1790430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Constraint UNIQUE parcial: previne double-booking no banco.
    // Ignora cancelados — um horário pode ser reutilizado após cancelamento.
    // Só se aplica a agendamentos com status ativo (pending, confirmed, completed).
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uniq_professional_start_active"
      ON "appointments" ("professional_id", "start_time")
      WHERE "status" != 'cancelled'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uniq_professional_start_active"`,
    );
  }
}