import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-client-dialog',
  standalone: false,
  templateUrl: './client-dialog.html',
  styleUrl: './client-dialog.scss'
})
export class ClientDialog {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data.id;
    this.form = this.fb.group({
      id: [data.id],
      name: [data.name, Validators.required],
      phone: [data.phone],
      address: [data.address],
      cityId: [data.cityId]
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
