import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Car from './Car';

@Entity('car_item')
export class CarItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Car, (car: Car) => car.items, {
    eager: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}

export default CarItem;
