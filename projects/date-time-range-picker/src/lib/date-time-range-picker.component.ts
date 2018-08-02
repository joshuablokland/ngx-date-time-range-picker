import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as moment_ from 'moment';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DateTimeRange } from './models/date-time-range';
const moment = moment_;

@Component({
  selector: 'ngx-date-time-range-picker',
  templateUrl: 'date-time-range-picker.component.html',
  styleUrls: ['date-time-range-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DateTimeRangePickerComponent implements OnInit {
  @Input() selectedStart: Date = moment().toDate();
  @Input() selectedEnd: Date = moment().toDate();
  @Input() getMonthUnavailability: (date: Date) => Observable<DateTimeRange[]>;
  @Output() dateTimeRangeSelected = new EventEmitter<DateTimeRange>();

  startMonthUnavailability: DateTimeRange[];
  endMonthUnavailability: DateTimeRange[];
  openStart = false;
  openEnd = false;
  disabledStart = false;
  disabledEnd = true;

  private startOfBlockEveryting: Date;
  constructor() {}

  ngOnInit() {
    this.getMonthUnavailability(this.selectedStart)
      .pipe(take(1))
      .subscribe((unavailability: DateTimeRange[]) => {
        this.startMonthUnavailability = unavailability;
      });
    this.evaluateEndMonthUnavailability(this.selectedEnd);
  }

  onDateTimeFromSelected(date: Date) {
    this.selectedStart = date;
    const firstPossibleEndDate = moment(date)
      .add(30, 'minutes')
      .toDate();
    this.selectedEnd = firstPossibleEndDate;
    this.disabledEnd = false;
    this.openEnd = true;
    this.openStart = false;
    this.startOfBlockEveryting = null;
    this.evaluateEndMonthUnavailability(firstPossibleEndDate);
  }

  onDateTimeUntilSelected(date: Date) {
    this.selectedEnd = date;
    this.openEnd = false;
    this.dateTimeRangeSelected.emit({ start: this.selectedStart, end: this.selectedEnd });
  }

  onStartMonthChanged(date: Date) {
    this.getMonthUnavailability(date)
      .pipe(take(1))
      .subscribe((unavailability: DateTimeRange[]) => {
        this.startMonthUnavailability = unavailability;
      });
  }

  onEndMonthChanged(date: Date) {
    this.evaluateEndMonthUnavailability(date);
  }

  private evaluateEndMonthUnavailability(date: Date) {
    this.getMonthUnavailability(date)
      .pipe(take(1))
      .subscribe((unavailabilityToUse: DateTimeRange[]) => {
        const isDateAfterSelectedStart = moment(date).isAfter(moment(this.selectedStart), 'minute');
        let blockEverything = false;
        if (this.startOfBlockEveryting) {
          blockEverything = moment(date).isAfter(moment(this.startOfBlockEveryting), 'month');
        }

        if (isDateAfterSelectedStart) {
          if (blockEverything) {
            unavailabilityToUse = this.getFullMonthUnavailability(date);
          } else {
            const filteredUnavailabilities = [];
            for (const unavailability of unavailabilityToUse) {
              if (moment(unavailability.start).isAfter(moment(this.selectedStart, 'minute'))) {
                filteredUnavailabilities.push(
                  this.getUnavailabilityUntilTheEndOfTheMonth(unavailability.start)
                );
                this.startOfBlockEveryting = unavailability.start;
                break;
              } else {
                filteredUnavailabilities.push(unavailability);
              }
            }
            unavailabilityToUse = [...filteredUnavailabilities];
          }
        }
        this.endMonthUnavailability = [...unavailabilityToUse];
      });
  }

  private getUnavailabilityUntilTheEndOfTheMonth(start: Date): DateTimeRange {
    const end = moment(start)
      .endOf('month')
      .toDate();

    return { start, end };
  }

  private getFullMonthUnavailability(date: Date): DateTimeRange[] {
    const start = moment(date)
      .startOf('month')
      .toDate();
    const end = moment(date)
      .endOf('month')
      .toDate();

    return [{ start, end }];
  }
}
