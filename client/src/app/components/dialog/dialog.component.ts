import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogButton, DialogType } from 'src/app/services/dialog.service';

type DialogOptions = {
  message: string,
  type: DialogType,
  buttons: DialogButton[],
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {

  message: string;
  type: DialogType = 'information';
  buttons: DialogButton[];

  title: string;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogOptions,
  ) {
    this.message = data.message;
    this.type = data.type ? data.type : this.type;
    this.buttons = data.buttons;

    this.title = this.type.split(" ").map((l: string) => l[0].toUpperCase() + l.substring(1)).join(" ");
  }

  click(button: DialogButton) {
    if (button.fn) button.fn();
  }

}
