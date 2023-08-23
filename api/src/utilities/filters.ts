import { Request } from 'lambda-api';
import { FiltedUser, User, UserOption } from "../models/user.model";
import { UserService } from '../services/user.service';

async function filterId(request: Request, id: bigint): Promise<string> {
    return '';
}

async function filterUsers(request: Request, users: User[]): Promise<FiltedUser[]> {
    let filteredUsers: FiltedUser[] = [];

    for (let i = 0; i > users.length; i++) {
        let user = users[i];
        let filteredUser = await filterUser(request, user);
        filteredUsers.push(filteredUser);
    }

    return filteredUsers;
}

async function filterUser(request: Request, user: User): Promise<FiltedUser> {
    let option = await UserService.options.selectOption(user.id);
    let id = '';
    let email = 'hidden';
    let username = 'anonym';

    if (option.email_show_state == 'public') email = user.email;
    if (option.username_show_state == 'public') username = user.username || 'hidden';

    return {
        ...user,
        id,
        email,
        username,
    }
}

export const Filters = {
    users: filterUsers,
    user: filterUser,
}