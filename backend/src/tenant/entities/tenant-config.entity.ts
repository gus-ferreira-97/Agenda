import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_configs')
export class TenantConfig {
  @PrimaryColumn()
  tenant_id: number;

  @OneToOne(() => Tenant, (tenant) => tenant.config)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'time', nullable: true })
  opening_time: string;

  @Column({ type: 'time', nullable: true })
  closing_time: string;

  @Column({ type: 'int', default: 30 })
  slot_interval: number;

  @Column({ length: 100, default: 'America/Sao_Paulo' })
  timezone: string;
}