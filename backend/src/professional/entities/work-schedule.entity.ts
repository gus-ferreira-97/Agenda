import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Professional } from './professional.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('work_schedules')
export class WorkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  professional_id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @ManyToOne(() => Professional, (professional) => professional.schedules)
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'int' }) // 0 = domingo, 1 = segunda, ..., 6 = sábado
  day_of_week: number;

  @Column({ type: 'time' })
  start_time: string; // usar string 'HH:mm' ou tipo Time do TypeORM

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'time', nullable: true })
  break_start: string;

  @Column({ type: 'time', nullable: true })
  break_end: string;
}