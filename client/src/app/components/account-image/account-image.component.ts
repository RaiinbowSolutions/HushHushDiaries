import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-account-image',
  templateUrl: './account-image.component.html',
  styleUrls: ['./account-image.component.css']
})
export class AccountImageComponent {
  @Input() src: string | undefined = undefined;
}
