import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage {
  private params: Subscription | null = null;
  private pagination: Subscription | null = null;
  users: User[] = [];
  page: number = 1;
  previus: number | null = null;
  next: number | null = null;
  
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.params = this.route.queryParams.subscribe(params => {
      this.page = params['page'] ?? 1;
      this.pagination = this.userService.getUsers(this.page).subscribe({
        next: (pagination) => {
          this.users = pagination.data;
          this.previus = pagination.previus ? pagination.page - 1 : null;
          this.next = pagination.next ? pagination.page + 1 : null;
        },
      });
    });
  }

  ngDestroy() {
    this.params?.unsubscribe();
    this.pagination?.unsubscribe();
  }
}
