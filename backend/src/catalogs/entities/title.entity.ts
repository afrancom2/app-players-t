import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('titles')
export class Title {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  nombre!: string;
}
