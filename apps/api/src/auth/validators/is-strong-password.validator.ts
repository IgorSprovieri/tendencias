import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && PASSWORD_REGEX.test(value);
        },
        defaultMessage() {
          return 'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número';
        },
      },
    });
  };
}
