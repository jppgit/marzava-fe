import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cost-dialog',
  standalone: false,
  templateUrl: './cost-dialog.html',
  styleUrl: './cost-dialog.scss'
})
export class CostDialog {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CostDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data.id;
    this.form = this.fb.group({
      id: [data.id],
      concept: [data.concept, Validators.required],
      amount: [data.amount || 0, [Validators.required, Validators.min(0)]],
      orderId: [data.orderId, Validators.required]
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
