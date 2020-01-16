import { User } from '../users/user.entity';

export enum CreateUserResultStatus {
    OK = 'OK',
    USERNAME_EXIST = 'USERNAME_EXIST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface CreateUserResult {
    success: boolean;
    status: CreateUserResultStatus;
    id?: User['id'];
}

export interface UpdateUserResult {
    success: boolean;
}
