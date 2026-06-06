import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CostDialog } from './cost-dialog/cost-dialog';
import { CostsService, Cost } from '../../services/costs.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-costos',
  standalone: false,
  templateUrl: './costos.html',
  styleUrl: './costos.scss'
})
export class Costos implements OnInit {
  displayedColumns: string[] = ['id', 'concept', 'amount', 'orderId', 'orderTitle', 'clientName', 'orderDate', 'orderStatus', 'actions'];


  data: Cost[] = [];
  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchText = '';

  private searchSubject = new Subject<string>();

  constructor(
    public dialog: MatDialog,
    private costsService: CostsService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchText = value;
      this.currentPage = 0;
      this.loadCosts();
    });
  }

  ngOnInit() {
    this.loadCosts();
  }

  loadCosts() {
    this.costsService.getCosts(this.searchText, this.currentPage + 1, this.pageSize)
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
    this.loadCosts();
  }

  openDialog(cost?: Cost): void {
    const dialogRef = this.dialog.open(CostDialog, {
      width: '400px',
      data: cost ? { ...cost } : { concept: '', amount: 0, orderId: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.costsService.updateCost(result.id, result).subscribe({
            next: () => this.loadCosts(),
            error: (err) => console.error(err)
          });
        } else {
          const { id, ...createData } = result;
          this.costsService.createCost(createData).subscribe({
            next: () => this.loadCosts(),
            error: (err) => console.error(err)
          });
        }
      }
    });
  }

  deleteCost(cost: Cost) {
    if (confirm(`¿Estás seguro de eliminar el costo ${cost.concept}?`)) {
      this.costsService.deleteCost(cost.id).subscribe({
        next: () => this.loadCosts(),
        error: (err) => console.error(err)
      });
    }
  }
}
