import { Time } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment_ from 'moment';
import { DateTimeRange } from '../models/date-time-range';
const moment = moment_;

@Component({
  selector: 'ngx-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss']
})
export class DateTimeComponent implements OnInit {
  @Input() monthUnavailabilities: DateTimeRange[] = [];
  @Output() monthChanged = new EventEmitter<Date>();
  @Output() dateTimeSelected = new EventEmitter<Date>();

  activeMoment: moment_.Moment = moment();

  // Month component needs:
  get year(): number {
    return this.activeMoment.year();
  }
  get currentMonth(): number {
    return this.activeMoment.month();
  }

  // Time component needs:
  timeUnavailabilities: DateTimeRange[] = [];
  get selectedDate(): Date {
    return this.activeMoment.toDate();
  }

  // Computed values:
  get monthName(): string {
    return this.activeMoment.format('MMMM');
  }

  constructor() {}

  ngOnInit() {}

  goToPreviousMonth(): void {
    this.activeMoment.subtract(1, 'months');
    this.monthChanged.emit(this.activeMoment.toDate());
  }

  goToNextMonth(): void {
    this.activeMoment.add(1, 'months');
    this.monthChanged.emit(this.activeMoment.toDate());
  }

  onDayMonthSelected(selectedDate: Date): void {
    this.calcuateTimeUnavailabilities(selectedDate);
    this.activeMoment.date(selectedDate.getDate());
  }

  onTimeSelected(selectedTime: Time): void {
    this.activeMoment
      .hour(selectedTime.hours)
      .minute(selectedTime.minutes)
      .startOf('minute');
    this.dateTimeSelected.emit(this.activeMoment.toDate());
  }

  private calcuateTimeUnavailabilities(date: Date): void {
    // Get only unavailabilities that affect the time for that day
    const newTimeUnavailabilities: DateTimeRange[] = [];
    const selectedDay = moment(date);
    const now = moment();

    for (const unavailability of this.monthUnavailabilities) {
      const startMoment = moment(unavailability.start);
      const endMoment = moment(unavailability.end);

      if (
        (startMoment.isBefore(selectedDay, 'day') || startMoment.isSame(selectedDay, 'day')) &&
        (endMoment.isAfter(selectedDay, 'day') || endMoment.isSame(selectedDay, 'day'))
      ) {
        newTimeUnavailabilities.push(unavailability);
      }
    }

    if (selectedDay.isSame(now, 'day')) {
      const startMoment = moment().startOf('day');
      const endMoment = moment().add(30, 'minutes');
      newTimeUnavailabilities.push({ start: startMoment.toDate(), end: endMoment.toDate() });
    }

    this.timeUnavailabilities = [...newTimeUnavailabilities];
  }
}
