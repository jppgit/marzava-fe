import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TasksTypeService, TaskType } from '../../../services/tasks-type.service';

@Component({
  selector: 'app-task-type-dialog',
  templateUrl: './task-type-dialog.html',
  styleUrl: './task-type-dialog.scss',
  standalone: false
})
export class TaskTypeDialog {
  form: FormGroup;
  isEdit = false;

  constructor(
    public dialogRef: MatDialogRef<TaskTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: TaskType | null,
    private fb: FormBuilder,
    private tasksTypeService: TasksTypeService
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      const formValue = this.form.value;
      if (this.isEdit && this.data) {
        this.tasksTypeService.update(this.data.id, formValue).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.tasksTypeService.create(formValue).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}
