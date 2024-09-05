import { Country } from '../enums';

export interface IUserForm {
  country: Country;
  username: string;
  birthday: string;
}
