import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import CarItem from './CarItem';

@Entity('car')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string | null;

  @Column({ type: 'varchar', length: 7 })
  plate: string | null;

  @Column({ type: 'varchar', length: 127 })
  brand: string | null;

  @Column({ type: 'varchar', length: 127 })
  model: string | null;

  @Column({ type: 'int' })
  km: number | null;

  @Column({ type: 'int' })
  year: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number | null;

  @Column({ type: 'varchar', length: 8 })
  status: string | null;

  @OneToMany(() => CarItem, (item) => item.car,{ cascade: ['insert'] })
  items: CarItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}

export default Car;
