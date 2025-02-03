import mongoose, { Schema, Document } from 'mongoose';

interface AddOnType {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation?: number;
  type: 'sticker' | 'emoji';
  letterId: string;
}

interface PaperType {
  texture: string;
  customStyle: {
    radius: number;
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    lineHeight: number;
  };
  cssStyles?: {
    [key: string]: any;
  };
}

interface FrameColorType {
  colorString: string;
  h: number;
  s: number;
  l: number;
}

interface LetterType extends Document {
  id: string;
  user_id: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  shareable_link: string;
  frameColor: FrameColorType;
  paper: PaperType;
  fontFamily: string;
  contentAlignment: string;
  addOns?: AddOnType[];
  createdAt: Date;
  updatedAt: Date;
}

const addOnSchema = new Schema<AddOnType>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  rotation: { type: Number },
  type: { type: String, enum: ['sticker', 'emoji'], required: true },
  letterId: { type: String, required: true }
});

const paperSchema = new Schema<PaperType>({
  texture: { type: String, required: true },
  customStyle: {
    radius: { type: Number, required: true },
    padding: {
      top: { type: Number, required: true },
      bottom: { type: Number, required: true },
      left: { type: Number, required: true },
      right: { type: Number, required: true }
    },
    lineHeight: { type: Number, required: true }
  },
  cssStyles: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

const frameColorSchema = new Schema<FrameColorType>({
  colorString: { type: String, required: true },
  h: { type: Number, required: true },
  s: { type: Number, required: true },
  l: { type: Number, required: true }
});

const letterSchema = new Schema<LetterType>({
  id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled' },
  content: { type: String, required: true },
  shareable_link: { type: String, required: true, unique: true },
  frameColor: frameColorSchema,
  paper: paperSchema,
  fontFamily: { type: String, required: true },
  contentAlignment: { type: String, default: 'top' },
  addOns: { type: [addOnSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Letter = mongoose.model<LetterType>('Letter', letterSchema);
export default Letter;