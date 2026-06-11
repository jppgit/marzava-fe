import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-status-dialog',
  standalone: false,
  templateUrl: './status-dialog.html',
  styleUrl: './status-dialog.scss'
})
export class StatusDialog {
  form: FormGroup;

  statuses = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<StatusDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { orderId: number | string; currentStatus: string }
  ) {
    this.form = this.fb.group({
      status: [data.currentStatus, Validators.required]
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.status);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
