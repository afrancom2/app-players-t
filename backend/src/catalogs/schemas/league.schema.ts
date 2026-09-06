import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LeagueDocument = HydratedDocument<League>;

@Schema({ timestamps: true })
export class League {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true, trim: true })
  pais!: string;
}

export const LeagueSchema = SchemaFactory.createForClass(League);
