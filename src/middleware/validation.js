import Joi from 'joi';

// Auth validation schemas
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

// Slogan generation validation schema
const sloganSchema = Joi.object({
  companyName: Joi.string().min(1).max(100).required(),
  industry: Joi.string().min(1).max(50).required(),
  brandPersonality: Joi.string().valid('friendly', 'professional', 'witty', 'premium', 'innovative').required(),
  keywords: Joi.array().items(Joi.string().max(30)).max(5).optional(),
  tone: Joi.string().valid('casual', 'formal', 'playful', 'serious', 'inspiring').optional()
});

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ error: errorMessage });
    }
    
    req.body = value;
    next();
  };
};

// Specific validation middleware
export const validateAuth = validate(authSchema);
export const validateRegister = validate(registerSchema);
export const validateSlogan = validate(sloganSchema);