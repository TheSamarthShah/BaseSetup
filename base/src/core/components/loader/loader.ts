import { Component, computed, inject, Input, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from 'src/core/services/loader-service';
@Component({
  selector: 'acty-loader',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss'
})
export class Loader {
  loaderService = inject(LoaderService)
  key = input.required<string>();
  visible = computed(() => this.loaderService.isLoading(this.key())());
}