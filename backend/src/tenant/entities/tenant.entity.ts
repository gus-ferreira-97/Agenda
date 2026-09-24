import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Professional } from '../../professional/entities/professional.entity';
import { Service } from '../../service/entities/service.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { AuditLog } from '../../audit-log/entities/audit-log.entity';
import { TenantConfig } from './tenant-config.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  subdomain: string;

  @Column({ length: 30, default: 'ativo' })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'basico' })
  plan: string;

  @Column({ type: 'timestamp', nullable: true })
  trial_started_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  trial_ends_at: Date | null;

  @Column({ type: 'boolean', default: false })
  trial_used: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Professional, (professional) => professional.tenant)
  professionals: Professional[];

  @OneToMany(() => Service, (service) => service.tenant)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.tenant)
  appointments: Appointment[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.tenant)
  auditLogs: AuditLog[];

  @OneToOne(() => TenantConfig, (config) => config.tenant)
  config: TenantConfig;

  @Column({ type: 'varchar', length: 7, default: '#2563eb' })
  primary_color: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  welcome_message: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  // ============ Soft Delete (LGPD) ============
  // Registros com deleted_at preenchido são ignorados automaticamente
  // pelas queries do TypeORM. Podem ser recuperados via .withDeleted().
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}