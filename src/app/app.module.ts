import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DateTimeRangePickerModule } from '../../projects/date-time-range-picker/src/public_api';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DateTimeRangePickerModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
