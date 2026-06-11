import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TasksTypeService, TaskType } from '../../services/tasks-type.service';
import { TaskTypeDialog } from './task-type-dialog/task-type-dialog';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
  standalone: false
})
export class Tareas implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<TaskType>();

  constructor(
    private tasksTypeService: TasksTypeService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTaskTypes();
  }

  loadTaskTypes() {
    this.tasksTypeService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  openDialog(taskType?: TaskType) {
    const dialogRef = this.dialog.open(TaskTypeDialog, {
      width: '400px',
      data: taskType ? { ...taskType } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTaskTypes();
      }
    });
  }

  deleteTaskType(id: number) {
    if (confirm('¿Estás seguro de eliminar este tipo de tarea?')) {
      this.tasksTypeService.remove(id).subscribe(() => {
        this.loadTaskTypes();
      });
    }
  }
}
