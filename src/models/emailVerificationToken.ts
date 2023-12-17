import { Model, ObjectId, Schema, model } from 'mongoose';
import { ref } from 'yup';

interface EmailVerificationTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 300, // 60 min * 60 sec
    default: Date.now(),
  },
});

emailVerificationTokenSchema.pre('save', function (next) {
  next();
});

export default model(
  'EmailVerificationToken',
  emailVerificationTokenSchema
) as Model<EmailVerificationTokenDocument>;
