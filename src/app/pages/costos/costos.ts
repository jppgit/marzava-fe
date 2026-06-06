import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CostDialog } from './cost-dialog/cost-dialog';
import { CostsService, Cost } from '../../services/costs.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

export interface OrderGroup {
  isGroup: true;
  orderId: number;
  orderTitle: string;
  clientName: string;
  orderDate: string;
  orderStatus: string;
  costs: Cost[];
  totalAmount: number;
  expanded: boolean;
}

export type TableRow = OrderGroup | Cost;

@Component({
  selector: 'app-costos',
  standalone: false,
  templateUrl: './costos.html',
  styleUrl: './costos.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class Costos implements OnInit {
  // Columnas compartidas para filas de grupo y de detalle
  displayedColumns: string[] = ['expand', 'col1', 'col2', 'col3', 'col4', 'col5', 'col6'];

  allCosts: Cost[] = [];
  orderGroups: OrderGroup[] = [];
  tableData: TableRow[] = [];

  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchText = '';
  filteredOrderId: number | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    public dialog: MatDialog,
    private costsService: CostsService,
    private route: ActivatedRoute
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
    this.route.queryParams.subscribe(params => {
      this.filteredOrderId = params['orderId'] ? +params['orderId'] : null;
      this.loadCosts();
    });
  }

  loadCosts() {
    this.costsService.getCosts(this.searchText, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (response: any) => {
          if (response && response.items) {
            this.allCosts = response.items;
            this.totalRows = response.total;
          } else if (Array.isArray(response)) {
            this.allCosts = response;
            this.totalRows = response.length;
          }
          this.buildGroups();
        },
        error: (err) => console.error(err)
      });
  }

  buildGroups() {
    const groupMap = new Map<number, OrderGroup>();

    for (const cost of this.allCosts) {
      const orderId = cost.orderId;
      if (!groupMap.has(orderId)) {
        const order = (cost as any).order;
        groupMap.set(orderId, {
          isGroup: true,
          orderId,
          orderTitle: order?.title ?? `Pedido #${orderId}`,
          clientName: order?.client?.name ?? '-',
          orderDate: order?.createdAt ?? '',
          orderStatus: order?.status ?? '-',
          costs: [],
          totalAmount: 0,
          expanded: false,
        });
      }
      const group = groupMap.get(orderId)!;
      group.costs.push(cost);
      group.totalAmount += cost.amount;
    }

    this.orderGroups = Array.from(groupMap.values());

    // Si venimos con un filtro de orderId, expandimos ese grupo automáticamente
    if (this.filteredOrderId !== null) {
      this.orderGroups.forEach(g => {
        g.expanded = g.orderId === this.filteredOrderId;
      });
    }

    this.rebuildTableData();
  }

  rebuildTableData() {
    const rows: TableRow[] = [];
    for (const group of this.orderGroups) {
      rows.push(group);
      if (group.expanded) {
        rows.push(...group.costs);
      }
    }
    this.tableData = rows;
  }

  toggleGroup(group: OrderGroup) {
    group.expanded = !group.expanded;
    this.rebuildTableData();
  }

  isGroup(_index: number, row: TableRow): boolean {
    return (row as OrderGroup).isGroup === true;
  }

  isCost(_index: number, row: TableRow): boolean {
    return (row as OrderGroup).isGroup !== true;
  }

  asGroup(row: TableRow): OrderGroup {
    return row as OrderGroup;
  }

  asCost(row: TableRow): Cost {
    return row as Cost;
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
      width: '620px',
      maxWidth: '95vw',
      data: cost ? { ...cost } : { orderId: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.id) {
        // Edición: un solo costo, tomamos el primero del array
        const costData = result.costs?.[0] ?? { concept: result.concept, amount: result.amount };
        this.costsService.updateCost(result.id, { ...costData, orderId: result.orderId }).subscribe({
          next: () => this.loadCosts(),
          error: (err) => console.error(err)
        });
      } else {
        // Creación: puede haber múltiples costos
        const creates = (result.costs as { concept: string; amount: number }[]).map(c =>
          this.costsService.createCost({ concept: c.concept, amount: c.amount, orderId: result.orderId })
        );
        // Ejecutar todas las creaciones en paralelo
        let completed = 0;
        creates.forEach(obs => obs.subscribe({
          next: () => { completed++; if (completed === creates.length) this.loadCosts(); },
          error: (err) => console.error(err)
        }));
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
