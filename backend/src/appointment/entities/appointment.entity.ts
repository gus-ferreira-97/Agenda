import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Professional } from '../../professional/entities/professional.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @Column({ type: 'int' })
  professional_id: number;

  @Column({ type: 'int' })
  service_id: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.appointments)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Professional, (professional) => professional.appointments)
  @JoinColumn({ name: 'professional_id' })
  professional: Professional;

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ length: 255 })
  customer_name: string;

  @Column({ length: 255 })
  customer_contact: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}