import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsUrlIfPresentConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Se o valor for undefined, null ou string vazia, não validar (é opcional)
    if (value === undefined || value === null || value === '') {
      return true;
    }
    
    // Se houver valor, validar se é uma URL válida
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a URL address`;
  }
}

export function IsUrlIfPresent(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUrlIfPresentConstraint,
    });
  };
}

