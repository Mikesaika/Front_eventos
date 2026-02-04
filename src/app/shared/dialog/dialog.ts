import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.css']
})
export class Dialog {

  @Input() data: any;

  constructor(public activeModal: NgbActiveModal) { }

  onNoClick(): void {
    this.activeModal.dismiss();
  }

  onYesClick(): void {
    this.activeModal.close(true);
  }
}