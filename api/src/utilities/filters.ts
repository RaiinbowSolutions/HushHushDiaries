import { Request } from 'lambda-api';
import { FiltedUser, User, UserOption } from "../models/user.model";

async function filterId(request: Request, id: bigint): string {
    
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

}

export const Filter = {
    users: filterUsers,
    user: filterUser,
}