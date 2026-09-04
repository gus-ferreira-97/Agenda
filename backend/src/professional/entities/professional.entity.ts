import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { ProfessionalService } from '../../service/entities/professional-service.entity';
import { WorkSchedule } from './work-schedule.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity('professionals')
export class Professional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.professionals)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  specialty: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProfessionalService, (ps) => ps.professional)
  professionalServices: ProfessionalService[];

  @OneToMany(() => WorkSchedule, (schedule) => schedule.professional)
  schedules: WorkSchedule[];

  @OneToMany(() => Appointment, (appointment) => appointment.professional)
  appointments: Appointment[];
}