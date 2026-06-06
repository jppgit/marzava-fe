import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-client-measurements',
  templateUrl: './client-measurements.html',
  styleUrl: './client-measurements.scss',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ClientMeasurements implements OnInit, OnChanges {
  @Input() medidasEdicion: any = null;
  @Output() guardar = new EventEmitter<any>();

  medidasForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<ClientMeasurements>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      if (this.data.medidasEdicion) {
        this.medidasEdicion = this.data.medidasEdicion;
      }
    }
  }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medidasEdicion'] && this.medidasEdicion && this.medidasForm) {
      this.medidasForm.patchValue(this.medidasEdicion);
    }
  }

  inicializarFormulario(): void {
    this.medidasForm = this.fb.group({
      // Columna 1
      contornoCuello: [''],
      longitudHombro: [''],
      anchoPecho: [''],
      separacionBusto: [''],
      alturaBusto: [''],
      alturaImperio: [''],
      radioCopa: [''],
      tamanoCopa: [''],
      escoteDelantero: [''],
      talleDelantero: [''],
      centroDelantero: [''],

      // Columna 2 - Superior
      largoBlusa: [''],
      largoChaleco: [''],
      largoChaqueta: [''],
      contornoStrapless: [''],
      contornoBusto: [''],
      contornoImperio: [''],
      contornoCintura: [''],
      contornoBaseA: [''],
      contornoCaderaBaseB: [''],
      alturaCadera: [''],
      costado: [''],
      espaldaHombroHombro: [''],
      anchoEspalda: [''],
      talleEspalda: [''],

      // Columna 3 - Espalda y Manga
      centroEspalda: [''],
      escoteEspalda: [''],
      contornoSisa: [''],
      contornoBrazo: [''],
      contornoAntebrazo: [''],
      contornoMuneca: [''],
      contornoPuno: [''],
      largoPuno: [''],
      largoMangaCorta: [''],
      largoMangaTresCuartos: [''],
      largoMangaLarga: [''],

      // Columna 4 - Inferior
      largoPantalon: [''],
      largoFalda: [''],
      largoShort: [''],
      tiroEnU: [''],
      tiroDelantero: [''],
      tiroPosterior: [''],
      largoHastaRodilla: [''],
      largoEntrepierna: [''],
      contornoPierna: [''],
      contornoRodilla: [''],
      contornoPantorrilla: [''],
      contornoTobillo: [''],
      contornoBota: [''],

      // Adicionales inferiores (Grid de 4x2)
      estatura: [''],
      largoCola: [''],
      alturaTacon: [''],
      capaVelo: [''],

      // Datos de cliente
      nombreCliente: [''],
      telefono: [''],
      direccion: [''],
      observaciones: ['']
    });

    if (this.medidasEdicion) {
      this.medidasForm.patchValue(this.medidasEdicion);
    }

    if (this.data) {
      if (this.data.clientName) {
        this.medidasForm.patchValue({ nombreCliente: this.data.clientName });
      }
      if (this.data.clientPhone) {
        this.medidasForm.patchValue({ telefono: this.data.clientPhone });
      }
      if (this.data.clientAddress) {
        this.medidasForm.patchValue({ direccion: this.data.clientAddress });
      }
    }
  }

  onSubmit(): void {
    if (this.medidasForm.valid) {
      if (this.dialogRef) {
        this.dialogRef.close(this.medidasForm.value);
      } else {
        this.guardar.emit(this.medidasForm.value);
      }
    }
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  limpiarFormulario(): void {
    this.medidasForm.reset();
  }
}
