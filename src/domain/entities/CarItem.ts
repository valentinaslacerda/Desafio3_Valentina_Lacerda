import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from 'typeorm';
import Car from './Car';

@Entity('car_item')
export class CarItem {
  @PrimaryGeneratedColumn('uuid')
  id: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string | null;

  @ManyToOne(() => Car, (car: Car) => car.items)
  car: Car;
}

export default CarItem;
