import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ClientDialog } from './client-dialog/client-dialog';
import { ClientsService, Client } from '../../services/clients.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientMeasurements } from '../../components/client-measurements/client-measurements';

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss'
})
export class Clientes implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'phone', 'address', 'medidas', 'actions'];
  data: Client[] = [];
  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchword = '';

  private searchSubject = new Subject<string>();

  constructor(
    public dialog: MatDialog,
    private clientsService: ClientsService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchword = value;
      this.currentPage = 0;
      this.loadClients();
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientsService.getClients(this.searchword, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (response: any) => {
          if (response && response.items) {
            this.data = response.items;
            this.totalRows = response.total;
          } else if (Array.isArray(response)) {
            this.data = response;
            this.totalRows = response.length;
          }
        },
        error: (err) => console.error(err)
      });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadClients();
  }

  openDialog(client?: Client): void {
    const dialogRef = this.dialog.open(ClientDialog, {
      width: '400px',
      data: client ? { ...client } : { name: '', phone: '', address: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          const { id, ...updateData } = result;
          this.clientsService.updateClient(result.id, updateData).subscribe({
            next: () => this.loadClients(),
            error: (err) => console.error(err)
          });
        } else {
          this.clientsService.createClient(result).subscribe({
            next: () => this.loadClients(),
            error: (err) => console.error(err)
          });
        }
      }
    });
  }

  deleteClient(client: Client) {
    if (confirm(`¿Estás seguro de eliminar a ${client.name}?`)) {
      this.clientsService.deleteClient(client.id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error(err)
      });
    }
  }

  openMeasurements(client: Client): void {
    const dialogRef = this.dialog.open(ClientMeasurements, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: {
        medidasEdicion: client.measurements,
        clientName: client.name,
        clientPhone: client.phone,
        clientAddress: client.address
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientsService.updateClient(client.id, { measurements: result }).subscribe({
          next: () => this.loadClients(),
          error: (err) => console.error(err)
        });
      }
    });
  }
}
