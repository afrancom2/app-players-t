import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TitleDocument = HydratedDocument<Title>;

@Schema({ timestamps: true })
export class Title {
  @Prop({ required: true, trim: true, unique: true })
  nombre!: string;
}

export const TitleSchema = SchemaFactory.createForClass(Title);
