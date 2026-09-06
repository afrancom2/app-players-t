import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Team } from '../../catalogs/entities/team.entity.js';
import { Title } from '../../catalogs/entities/title.entity.js';
import { Player } from './player.entity.js';

@Entity('player_palmares')
export class Palmares {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'player_id' })
  playerId!: number;

  @ManyToOne(() => Player, (player) => player.palmares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Relation<Player>;

  @Column({ name: 'titulo_id' })
  tituloId!: number;

  @ManyToOne(() => Title, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'titulo_id' })
  titulo!: Relation<Title>;

  @Column()
  cantidad!: number;

  @Column({ name: 'club_id', nullable: true })
  clubId?: number;

  @ManyToOne(() => Team, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'club_id' })
  club?: Relation<Team>;
}
