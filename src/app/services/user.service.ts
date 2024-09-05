import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CheckUserResponseData,
  IUserForm,
  SubmitFormResponseData,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient: HttpClient = inject(HttpClient);

  checkUniqueUserName$(username: string): Observable<CheckUserResponseData> {
    return this.httpClient.post<CheckUserResponseData>('/api/checkUsername', {
      username,
    });
  }

  submitForms$(value: IUserForm[]): Observable<SubmitFormResponseData> {
    return this.httpClient.post<SubmitFormResponseData>('/api/submitForm', {
      value,
    });
  }
}
