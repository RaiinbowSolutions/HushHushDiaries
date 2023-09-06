import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '../components/dialog/dialog.component';

export type DialogButton = {
  text: string,
  fn: Function | undefined,
}

export type DialogType = 'error' | 'warning' | 'information';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  open(message: string, type: DialogType, buttons: DialogButton[] = [], timeoutInSeconds: number | null = 5) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.hasBackdrop = false;
    dialogConfig.panelClass = 'dialog-container';
    dialogConfig.data = {
        message,
        type,
        buttons,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef.afterOpened().subscribe(_ => {
      if (timeoutInSeconds) {
        setTimeout(() => dialogRef.close(), timeoutInSeconds * 1000);
      }
    });
  }

}
